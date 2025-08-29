import mongoose from "mongoose";
import { ProductPricingCache } from "../types";

const priceSchema = new mongoose.Schema({
    priceType: {
        type: String,
        enum: ["base", "additional"],
    },
    availableOptions: {
        type: Object,
        of: Number
    }
}, { _id: false })

const productCacheSchema = new mongoose.Schema<ProductPricingCache>({
    productId: {
        type: String,
        required: true,
    },
    priceConfiguration: {
        type: Object,
        of: priceSchema
    }
})

const ProductCacheModel = mongoose.model("productPricingCache", productCacheSchema, "productCache")
export default ProductCacheModel;