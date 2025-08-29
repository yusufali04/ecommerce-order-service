import { ProductMessage } from "../types";
import ProductCacheModel from "./productCacheModel";

export const handleProductUpdate = async (value: string) => {
    const product: ProductMessage = JSON.parse(value);
    return await ProductCacheModel.updateOne({
        productId: product.id
    }, {
        $set: {
            priceConfiguration: product.priceConfiguration
        }
    }, { upsert: true })
}