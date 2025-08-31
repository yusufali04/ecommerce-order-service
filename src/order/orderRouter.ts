import express from "express";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";
import { OrderController } from "./orderController";
import { StripeGateway } from "../payment/stripe";

const router = express.Router();
const paymentGateway = new StripeGateway();
const orderController = new OrderController(paymentGateway);

router.post("/", authenticate, asyncWrapper(orderController.create))

export default router;
