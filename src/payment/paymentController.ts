import { Request, Response } from "express";
import { PaymentGateway } from "./paymentTypes";
import OrderModel from "../order/orderModel";
import { PaymentStatus } from "../order/orderTypes";

export class PaymentController {
    constructor(private paymentGateway: PaymentGateway) { }
    handleWebHook = async (req: Request, res: Response) => {
        const webHookBody = req.body;
        if (webHookBody.type === 'checkout.session.completed') {
            const verifiedSession = await this.paymentGateway.getSession(webHookBody.data.object.id);
            console.log("verified session", verifiedSession);
            const isPaymentSuccess = verifiedSession.paymentStatus === PaymentStatus.PAID;
            await OrderModel.updateOne({
                _id: verifiedSession.metadata.orderId,
            }, {
                $set: { paymentStatus: isPaymentSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED }
            }, { new: true })
            // todo: Send update to Kafka broker
        }
        console.log(webHookBody);

        res.json({ success: true })
    }
}