import mongoose, { Schema } from "mongoose";
import { Order, OrderStatus, PaymentMode, PaymentStatus } from "./orderTypes";
import { CartItem } from "../types";

const toppingSchema = new mongoose.Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    image: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: false })

const cartSchema = new mongoose.Schema<CartItem>({
    name: String,
    image: String,
    qty: Number,
    priceConfiguration: {
        type: Map,
        of: {
            priceType: {
                type: String,
                enum: ["base", "additional"],
                required: true
            },
            availableOptions: {
                type: Map,
                of: Number,
                required: true
            }
        }
    },
    chosenConfiguration: {
        priceConfiguration: {
            type: Map,
            of: String,
            required: true
        },
        selectedToppings: [
            {
                type: [toppingSchema],
                required: true
            }
        ]
    }
}, { _id: false })

const orderSchema = new mongoose.Schema<Order>({
    cart: [{ type: [cartSchema], required: true }],
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    total: { type: Number, required: true },
    discount: { type: Number, required: true },
    taxes: { type: Number, required: true },
    deliveryCharges: { type: Number, required: true },
    address: { type: String, required: true },
    tenantId: { type: String, required: true },
    comment: { type: String },
    paymentMode: { type: String, enum: PaymentMode, required: true },
    orderStatus: { type: String, enum: OrderStatus, required: true },
    paymentStatus: { type: String, enum: PaymentStatus, required: true },
    paymentReferenceId: { type: String, default: null }
}, { timestamps: true })

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;