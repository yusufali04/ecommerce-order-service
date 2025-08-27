import mongoose from "mongoose";
import { Coupon } from "./couponTypes";

const couponSchema = new mongoose.Schema<Coupon>({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    validUpto: { type: Date, required: true },
    tenantId: { type: Number, required: true }
})

export const CouponModel = mongoose.model("Coupon", couponSchema);