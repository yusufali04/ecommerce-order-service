import { CouponModel } from "./couponModel";
import { Coupon } from "./couponTypes";

export class CouponService {
    async create(couponData: Coupon) {
        return (await CouponModel.create(couponData)).save();
    }
    async update(couponId: string, couponData: Partial<Coupon>) {
        return await CouponModel.findByIdAndUpdate(couponId, couponData, { new: true });
    }
    async getAll(tenantId: string) {
        return await CouponModel.find({ tenantId });
    }
    async getById(couponId: string) {
        return await CouponModel.findById(couponId);
    }
    async delete(couponId: string) {
        return await CouponModel.findByIdAndDelete(couponId);
    }
}