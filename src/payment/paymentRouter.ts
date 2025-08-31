import express from "express";
import { asyncWrapper } from "../utils";
import { PaymentController } from "./paymentController";
import { StripeGateway } from "./stripe";
const router = express.Router();

// Move this instantiation to factory function
const paymentGateway = new StripeGateway();
const controller = new PaymentController(paymentGateway);

router.post("/webhook", asyncWrapper(controller.handleWebHook))

export default router;
