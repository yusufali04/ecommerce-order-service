import Stripe from "stripe";
import config from "config";
import { PaymentGateway, PaymentOptions } from "./paymentTypes";

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
            success_url: `${config.get("frontend.clientUIURL")}/payment?success=true&orderId=${options.orderId}`,
            cancel_url: `${config.get("frontend.clientUIURL")}/payment?success=false&orderId=${options.orderId}`
        }, { idempotencyKey: options.idempotencyKey });

        return {
            id: session.id,
            paymentUrl: session.url,
            paymentStatus: session.payment_status
        }
    }

    async getSession() {
        return null
    }
}