import { ToppingMessage } from "../types";
import ToppingCacheModel from "./toppingCacheModel";

export const handleToppingUpdate = async (value: string) => {
    const topping: ToppingMessage = JSON.parse(value);
    return await ToppingCacheModel.updateOne({
        toppingId: topping.data.id
    }, {
        $set: {
            price: topping.data.price,
            tenantId: topping.data.tenantId
        }
    }, { upsert: true })
}