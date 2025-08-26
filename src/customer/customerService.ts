import CustomerModel from "./customerModel";
import { Customer } from "./customerTypes";

export class CustomerService {
    async getCustomerById(userId: string): Promise<Customer | null> {
        return await CustomerModel.findOne({ userId });
    }
    async createCustomer(customerData: Customer): Promise<Customer> {
        return await CustomerModel.create(customerData)
    }
}
