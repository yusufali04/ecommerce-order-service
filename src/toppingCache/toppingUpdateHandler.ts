import { ToppingMessage } from "../types";
import ToppingCacheModel from "./toppingCacheModel";

export const handleToppingUpdate = async (value: string) => {
    const product: ToppingMessage = JSON.parse(value);
    return await ToppingCacheModel.updateOne({
        toppingId: product.id
    }, {
        $set: {
            price: product.price
        }
    }, { upsert: true })
}