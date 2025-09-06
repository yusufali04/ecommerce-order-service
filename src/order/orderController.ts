import { NextFunction, Request, Response } from "express";
import { Request as AuthRequest } from "express-jwt";
import { CartItem, ProductPricingCache, Topping, ToppingPricingCache } from "../types";
import ProductCacheModel from "../productCache/productCacheModel";
import ToppingCacheModel from "../toppingCache/toppingCacheModel";
import { CouponModel } from "../coupon/couponModel";
import OrderModel from "./orderModel";
import { OrderStatus, PaymentMode, PaymentStatus } from "./orderTypes";
import IdempotencyModel from "../idempotency/idempotencyModel";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import { PaymentGateway } from "../payment/paymentTypes";
import { MessageBroker } from "../types/broker";
import CustomerModel from "../customer/customerModel";

export class OrderController {
    constructor(private paymentGateway: PaymentGateway, private broker: MessageBroker) { }
    create = async (req: Request, res: Response, next: NextFunction) => {
        const { cart, tenantId, paymentMode, customerId, comment, address, couponCode } = req.body

        const subTotal = await this.calculateTotal(req.body.cart);
        let discountPercentage = 0;
        if (couponCode) {
            discountPercentage = await this.getDiscountPercentage(couponCode, tenantId)
        }
        const discountAmount = parseFloat((subTotal * discountPercentage / 100).toFixed(2))
        const priceAfterDiscount = parseFloat((subTotal - discountAmount).toFixed(2));

        // Todo: Store in DB for each tenant
        const TAXES_PERCENT = 18;
        const DELIVERY_CHARGES = 50;
        const taxes = parseFloat((priceAfterDiscount * TAXES_PERCENT / 100).toFixed(2));
        const finalTotal = parseFloat((priceAfterDiscount + taxes + DELIVERY_CHARGES).toFixed(2));

        const idempotencyKey = req.headers["idempotency-key"];

        const idempotency = await IdempotencyModel.findOne({ key: idempotencyKey });
        let newOrder = idempotency ? [idempotency.response] : [];
        if (!idempotency) {
            const session = await mongoose.startSession();
            await session.startTransaction();
            try {
                // create an order
                newOrder = await OrderModel.create([{
                    cart,
                    customerId,
                    total: finalTotal,
                    discount: discountAmount,
                    taxes,
                    deliveryCharges: DELIVERY_CHARGES,
                    address,
                    tenantId,
                    comment,
                    paymentMode,
                    orderStatus: OrderStatus.RECEIVED,
                    paymentStatus: PaymentStatus.PENDING
                }], { session });
                await IdempotencyModel.create([{ key: idempotencyKey, response: newOrder[0] }], { session })
                // Commit transaction
                await session.commitTransaction();
            } catch (err) {
                // Abort transaction
                await session.abortTransaction();
                await session.endSession();
                return next(createHttpError(500, err.message))
            } finally {
                await session.endSession();
            }
        }
        if (paymentMode === PaymentMode.CARD) {
            // Payment processing...    
            const session = await this.paymentGateway.createSession({
                amount: finalTotal,
                orderId: (newOrder[0]._id).toString(),
                tenantId: tenantId,
                idempotencyKey: idempotencyKey as string
            });

            // Update payment id to order in db
            await this.broker.sendMessage("order", JSON.stringify(newOrder));
            return res.status(200).json({ paymentURL: session.paymentUrl });
        }
        await this.broker.sendMessage("order", JSON.stringify(newOrder));
        return res.json({ paymentURL: null })
    }
    getMine = async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.auth.sub;
        if (!userId) {
            return next(createHttpError(400, "Invalid user"))
        }
        const customer = await CustomerModel.findOne({ userId });
        if (!customer) {
            return next(createHttpError(404, "Customer not found"))
        }
        // todo: Implement pagination
        const orders = await OrderModel.find({ customerId: customer._id }, { cart: 0 }).sort({ createdAt: -1 });
        return res.json(orders);
    }
    getSingle = async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { orderId } = req.params;
        const { sub: userId, role, tenant: tenantId } = req.auth;
        const fields = req.query.fields ? req.query.fields.toString().split(',') : [];

        const projection = fields.reduce((acc, field) => {
            acc[field] = 1;
            return acc;
        }, { customerId: 1 })
        const order = await OrderModel.findOne({ _id: orderId }, { ...projection }).populate('customerId').exec();
        if (!order) {
            return next(createHttpError(404, "Order not found"))
        }
        const myRestaurantOrder = order.tenantId === tenantId;
        if (role === 'admin' || (role === 'manager' && myRestaurantOrder)) {
            return res.json(order);
        }
        if (role === 'customer') {
            const customer = await CustomerModel.findOne({ userId });
            if (!customer) {
                return next(createHttpError(404, "Customer not found"))
            }
            if (customer._id.toString() === order.customerId._id.toString()) {
                return res.json(order);
            }
        }
        return next(createHttpError(403, "Operation not permitted"))
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
    private getDiscountPercentage = async (
        couponCode: string,
        tenantId: string,
    ) => {
        const code = await CouponModel.findOne({ code: couponCode, tenantId });
        if (!code) {
            return 0;
        }
        const currentDate = new Date();
        const couponDate = new Date(code.validUpto);

        if (currentDate <= couponDate) {
            return code.discount;
        }
        return 0;
    };
}