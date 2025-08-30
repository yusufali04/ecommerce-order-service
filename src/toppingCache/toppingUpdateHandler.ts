import { ToppingMessage } from "../types";
import ToppingCacheModel from "./toppingCacheModel";

export const handleToppingUpdate = async (value: string) => {
    const topping: ToppingMessage = JSON.parse(value);
    return await ToppingCacheModel.updateOne({
        toppingId: topping.id
    }, {
        $set: {
            price: topping.price,
            tenantId: topping.tenantId
        }
    }, { upsert: true })
}