import { NextFunction, Request, Response } from "express";
import { PaymentGateway } from "./paymentTypes";
import OrderModel from "../order/orderModel";
import { OrderEvents, PaymentStatus } from "../order/orderTypes";
import { MessageBroker } from "../types/broker";
import createHttpError from "http-errors";
import CustomerModel from "../customer/customerModel";

export class PaymentController {
    constructor(private paymentGateway: PaymentGateway, private broker: MessageBroker) { }
    handleWebHook = async (req: Request, res: Response, next: NextFunction) => {
        const webHookBody = req.body;
        if (webHookBody.type === 'checkout.session.completed') {
            const verifiedSession = await this.paymentGateway.getSession(webHookBody.data.object.id);
            const isPaymentSuccess = verifiedSession.paymentStatus === PaymentStatus.PAID;
            const updatedOrder = await OrderModel.findOneAndUpdate({
                _id: verifiedSession.metadata.orderId,
            }, {
                $set: { paymentStatus: isPaymentSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED }
            }, { new: true })
            const customer = await CustomerModel.findOne({ _id: updatedOrder.customerId });
            if (!customer) {
                return next(createHttpError(404, "Customer not found"))
            }
            // Send update to Kafka broker
            // Think about broker message fails
            const brokerMessage = {
                event_type: OrderEvents.PAYMENT_STATUS_UPDATE,
                data: { ...updatedOrder.toObject(), customerId: customer }
            }
            await this.broker.sendMessage("order", JSON.stringify(brokerMessage), updatedOrder._id.toString());
        }
        res.json({ success: true })
    }
}