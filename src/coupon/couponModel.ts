import mongoose from "mongoose";
import { Coupon } from "./couponTypes";

const couponSchema = new mongoose.Schema<Coupon>({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    validUpto: { type: Date, required: true },
    tenantId: { type: Number, required: true }
}, { timestamps: true })

// Create a compound index on tenantId and code for faster lookup
couponSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export const CouponModel = mongoose.model("Coupon", couponSchema);