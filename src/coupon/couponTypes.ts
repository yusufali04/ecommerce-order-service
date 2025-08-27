import mongoose from "mongoose";

export interface Coupon {
    _id?: mongoose.Types.ObjectId;
    title: string;
    code: string;
    discount: number;
    validUpto: Date;
    tenantId: number;
    createdAt: Date;
    updatedAt: Date;
}