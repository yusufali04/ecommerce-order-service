import mongoose from "mongoose";
import { Address, Customer } from "./customerTypes";

const addressSchema = new mongoose.Schema<Address>({
    text: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
}, { _id: false });
const customerSchema = new mongoose.Schema<Customer>({
    userId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    addresses: { type: [addressSchema], required: false }
}, { timestamps: true });

const CustomerModel = mongoose.model<Customer>("Customer", customerSchema);

export default CustomerModel;