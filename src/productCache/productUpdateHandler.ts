import { ProductMessage } from "../types";
import ProductCacheModel from "./productCacheModel";

export const handleProductUpdate = async (value: string) => {
    const product: ProductMessage = JSON.parse(value);
    return await ProductCacheModel.updateOne({
        productId: product.data.id
    }, {
        $set: {
            priceConfiguration: product.data.priceConfiguration
        }
    }, { upsert: true })
}