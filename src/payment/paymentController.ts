import { Request, Response } from "express";
import { PaymentGateway } from "./paymentTypes";
import OrderModel from "../order/orderModel";
import { OrderEvents, PaymentStatus } from "../order/orderTypes";
import { MessageBroker } from "../types/broker";

export class PaymentController {
    constructor(private paymentGateway: PaymentGateway, private broker: MessageBroker) { }
    handleWebHook = async (req: Request, res: Response) => {
        const webHookBody = req.body;
        if (webHookBody.type === 'checkout.session.completed') {
            const verifiedSession = await this.paymentGateway.getSession(webHookBody.data.object.id);
            const isPaymentSuccess = verifiedSession.paymentStatus === PaymentStatus.PAID;
            const updatedOrder = await OrderModel.findOneAndUpdate({
                _id: verifiedSession.metadata.orderId,
            }, {
                $set: { paymentStatus: isPaymentSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED }
            }, { new: true })
            // Send update to Kafka broker
            // Think about broker message fails
            const brokerMessage = {
                event_type: OrderEvents.PAYMENT_STATUS_UPDATE,
                data: updatedOrder
            }
            await this.broker.sendMessage("order", JSON.stringify(brokerMessage), updatedOrder._id.toString());
        }
        res.json({ success: true })
    }
}