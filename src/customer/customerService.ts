import CustomerModel from "./customerModel";
import { Address, Customer } from "./customerTypes";

export class CustomerService {
    async getCustomerById(userId: string): Promise<Customer | null> {
        return await CustomerModel.findOne({ userId });
    }
    async createCustomer(customerData: Customer): Promise<Customer> {
        return await CustomerModel.create(customerData)
    }
    async addAddress(customerId: string, userId: string, newAddress: Address): Promise<Customer | null> {
        return await CustomerModel.findOneAndUpdate({ _id: customerId, userId }, { $push: { addresses: newAddress } }, { new: true });
    }
}