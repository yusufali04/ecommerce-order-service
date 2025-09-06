import express from "express";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";
import { OrderController } from "./orderController";
import { StripeGateway } from "../payment/stripe";
import { createMessageBroker } from "../common/factories/brokerFactory";

const router = express.Router();
const paymentGateway = new StripeGateway();
const broker = createMessageBroker();
const orderController = new OrderController(paymentGateway, broker);

router.post("/", authenticate, asyncWrapper(orderController.create))
router.get("/", authenticate, asyncWrapper(orderController.getAll))
router.get("/mine", authenticate, asyncWrapper(orderController.getMine))
router.get("/:orderId", authenticate, asyncWrapper(orderController.getSingle))

export default router;
