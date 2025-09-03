import { Response } from "express";
import { Request } from "express-jwt";
import { Request as ExpressRequest } from "express";
import { CouponService } from "./couponService";
import { Coupon } from "./couponTypes";

// how the date should be passed in the request
// The date should be passed in the request body as a string in the format "YYYY-MM-DDTHH:mm:ss.sssZ"
// list all the accepted date formats

export class CouponController {
    constructor(private couponService: CouponService) { }
    create = async (req: Request, res: Response) => {

        const { role, tenant } = req.auth!;
        if (role !== "admin" && role !== "manager") {
            return res.status(403).json({ message: "Forbidden" });
        }
        const tenantId = role === "admin" ? req.body.tenantId : tenant;
        const { title, code, discount, validUpto } = req.body;
        const coupon = await this.couponService.create({ title, code, discount, validUpto, tenantId } as Coupon);
        res.status(201).json(coupon);
    }
    update = async (req: Request, res: Response) => {
        const { role, tenant } = req.auth!;
        const { couponId } = req.params;
        const coupon = await this.couponService.getById(couponId);
        if (role !== "admin" && role !== "manager" && coupon.tenantId !== tenant) {
            return res.status(403).json({ message: "Forbidden" });
        }
        const tenantId = role === "admin" ? req.body.tenantId : tenant;
        const { title, code, discount, validUpto } = req.body;
        const updatedCoupon = await this.couponService.update(couponId, { title, code, discount, validUpto, tenantId } as Partial<Coupon>);
        res.status(200).json(updatedCoupon);
    }
    getAll = async (req: Request, res: Response) => {
        const { role, tenant } = req.auth!;
        if (role !== "admin" && role !== "manager") {
            return res.status(403).json({ message: "Forbidden" });
        }
        const tenantId = role === "admin" ? req.query.tenantId as string : tenant;
        const coupons = await this.couponService.getAll(tenantId);
        res.status(200).json(coupons);
    }
    getById = async (req: Request, res: Response) => {
        const { couponId } = req.params;
        const { tenant, role } = req.auth!;
        const coupon = await this.couponService.getById(couponId);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        if (coupon.tenantId !== tenant && role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }
        res.status(200).json(coupon);
    }
    delete = async (req: Request, res: Response) => {
        const { role, tenant } = req.auth!;
        const { couponId } = req.params;
        const coupon = await this.couponService.getById(couponId);
        if (role !== "admin" && role !== "manager" && coupon.tenantId !== tenant) {
            return res.status(403).json({ message: "Forbidden" });
        }
        const deletedCoupon = await this.couponService.delete(couponId);
        res.status(200).json(deletedCoupon);
    }
    verify = async (req: ExpressRequest, res: Response) => {
        const { code, tenantId } = req.body;
        const coupon = await this.couponService.verify(code, tenantId);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found or invalid" });
        }
        // validate expiry
        const currentDate = new Date();
        const couponDate = new Date(coupon.validUpto);
        if (currentDate <= couponDate) {
            return res.json({ valid: true, discount: coupon.discount })
        }
        res.status(200).json({ valid: false, discount: 0 });
    }
}