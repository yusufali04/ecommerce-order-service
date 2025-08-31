import express from "express";
import { asyncWrapper } from "../utils";
import { PaymentController } from "./paymentController";
import { StripeGateway } from "./stripe";
import { createMessageBroker } from "../common/factories/brokerFactory";
const router = express.Router();

// Move this instantiation to factory function
const paymentGateway = new StripeGateway();
const broker = createMessageBroker();
const controller = new PaymentController(paymentGateway, broker);

router.post("/webhook", asyncWrapper(controller.handleWebHook))

export default router;
