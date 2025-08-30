import mongoose from "mongoose";
import { ToppingPricingCache } from "../types";

const toppingSchema = new mongoose.Schema<ToppingPricingCache>({
    toppingId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    tenantId: {
        type: String,
        required: true
    }
}, { timestamps: true })

const ToppingCacheModel = mongoose.model("toppingCache", toppingSchema, "toppingCache");

export default ToppingCacheModel;