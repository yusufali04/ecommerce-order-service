import Stripe from "stripe";
import config from "config";
import { CustomMetadata, PaymentGateway, PaymentOptions, VerifiedSession } from "./paymentTypes";

export class StripeGateway implements PaymentGateway {
    private stripe: Stripe;
    constructor() {
        this.stripe = new Stripe(config.get("stripe.secretKey"));
    }
    async createSession(options: PaymentOptions) {
        const session = await this.stripe.checkout.sessions.create({
            metadata: {
                orderId: options.orderId
            },
            billing_address_collection: 'required',
            // todo: get customer email from database
            // customer_email: options.email,
            // todo: Capture structured address from customer
            // payment_intent_data: {
            //     shipping: {
            //         name: "Yousuf",
            //         address: {
            //             line1: "Hyderabad, India",
            //             city: "Hyderabad",
            //             country: "India",
            //             postal_code: "500018"
            //         },

            //     }
            // },
            line_items: [
                {
                    price_data: {
                        unit_amount: options.amount * 100,
                        product_data: {
                            name: "Online Pizza Order",
                            description: "Total amount to be paid",
                            images: [
                                "http://placehold.jp/150x150.png"
                            ]
                        },
                        currency: options.currency || "inr"
                    },
                    quantity: 1
                }
            ],
            mode: "payment",
            success_url: `${config.get("frontend.clientUIURL")}/payment?success=true&orderId=${options.orderId}&restaurant=${options.tenantId}`,
            cancel_url: `${config.get("frontend.clientUIURL")}/payment?success=false&orderId=${options.orderId}&restaurant=${options.tenantId}`
        }, { idempotencyKey: options.idempotencyKey });

        return {
            id: session.id,
            paymentUrl: session.url,
            paymentStatus: session.payment_status
        }
    }

    async getSession(id: string) {
        const session = await this.stripe.checkout.sessions.retrieve(id);
        const verifiedSession: VerifiedSession = {
            id: session.id,
            paymentStatus: session.payment_status,
            metadata: session.metadata as unknown as CustomMetadata
        }
        return verifiedSession;
    }
}