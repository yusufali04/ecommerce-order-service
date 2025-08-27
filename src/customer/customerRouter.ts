import express from "express";
import { asyncWrapper } from "../utils";
import { CustomerController } from "./customerController";
import authenticate from "../common/middleware/authenticate";
import { CustomerService } from "./customerService";
import logger from "../config/logger";

const customerRouter = express.Router();
const customerService = new CustomerService();
const customerController = new CustomerController(customerService, logger);

customerRouter.get("/", authenticate, asyncWrapper(customerController.getCustomer))
customerRouter.patch("/addresses/:customerId", authenticate, asyncWrapper(customerController.addAddress))


export default customerRouter;