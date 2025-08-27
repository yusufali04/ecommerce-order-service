import express from "express";
import { asyncWrapper } from "../utils";
import { CouponService } from "./couponService";
import { CouponController } from "./couponController";
import authenticate from "../common/middleware/authenticate";

const couponRouter = express.Router();
const couponService = new CouponService();
const couponController = new CouponController(couponService)


couponRouter.post("/", authenticate, asyncWrapper(couponController.create));
couponRouter.put("/:couponId", authenticate, asyncWrapper(couponController.update));
couponRouter.get("/", authenticate, asyncWrapper(couponController.getAll));
couponRouter.get("/:couponId", authenticate, asyncWrapper(couponController.getById));
couponRouter.delete("/:couponId", authenticate, asyncWrapper(couponController.delete));

export default couponRouter;