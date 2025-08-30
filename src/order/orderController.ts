import { Request, Response } from "express";
import { CartItem, ProductPricingCache, Topping, ToppingPricingCache } from "../types";
import ProductCacheModel from "../productCache/productCacheModel";
import ToppingCacheModel from "../toppingCache/toppingCacheModel";

export class OrderController {
    constructor() { }
    create = async (req: Request, res: Response) => {
        const totalPrice = await this.calculateTotal(req.body.cart);

        res.status(200).json({ totalPrice });
    }

    private calculateTotal = async (cart: CartItem[]) => {
        const productIds = cart.map(item => item._id);

        const productPricings = await ProductCacheModel.find({
            productId: {
                $in: productIds
            }
        })

        const cartToppingIds = cart.reduce((acc, item) => {
            return [
                ...acc,
                ...item.chosenConfiguration.selectedToppings.map(topping => topping._id)
            ]
        }, [])

        const toppingPrices = await ToppingCacheModel.find({
            toppingId: {
                $in: cartToppingIds
            }
        });

        const totalPrice = cart.reduce((acc, curr) => {
            const cachedProductPrice = productPricings.find(
                (product) => product.productId === curr._id,
            );

            return (
                acc +
                curr.qty * this.getItemTotal(curr, cachedProductPrice, toppingPrices)
            );
        }, 0);
        return totalPrice;
    }

    private getItemTotal = (
        item: CartItem,
        cachedProductPrice: ProductPricingCache,
        toppingsPricings: ToppingPricingCache[],
    ) => {
        const toppingsTotal = item.chosenConfiguration.selectedToppings.reduce(
            (acc, curr) => {
                return acc + this.getCurrentToppingPrice(curr, toppingsPricings);
            },
            0,
        );

        const productTotal = Object.entries(
            item.chosenConfiguration.priceConfiguration,
        ).reduce((acc, [key, value]) => {
            const price =
                cachedProductPrice.priceConfiguration[key].availableOptions[value];
            return acc + price;
        }, 0);

        return productTotal + toppingsTotal;
    };
    private getCurrentToppingPrice = (topping: Topping, toppingPricings: ToppingPricingCache[]) => {
        const currentTopping = toppingPricings.find(
            (current) => topping._id === current.toppingId,
        );

        if (!currentTopping) {
            // todo: Make sure the item is in the cache else, maybe call catalog service.
            return topping.price;
        }

        return currentTopping.price;
    };

    // private getDiscountPercentage = async (
    //     couponCode: string,
    //     tenantId: string,
    // ) => {
    //     const code = await CouponModel.findOne({ code: couponCode, tenantId });

    //     if (!code) {
    //         return 0;
    //     }

    //     const currentDate = new Date();
    //     const couponDate = new Date(code.validUpto);

    //     if (currentDate <= couponDate) {
    //         return code.discount;
    //     }

    //     return 0;
    // };
}