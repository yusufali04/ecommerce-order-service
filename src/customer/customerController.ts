import { Response } from "express";
import { Request } from "express-jwt";
import { CustomerService } from "./customerService";
import { Address, Customer } from "./customerTypes";
import { Logger } from "winston";

export class CustomerController {
    constructor(private customerService: CustomerService, private logger: Logger) { }
    getCustomer = async (req: Request, res: Response) => {
        const { sub: userId, firstName, lastName, email } = req.auth;

        this.logger.info(`Fetching customer for userId: ${userId}`);
        const customer = await this.customerService.getCustomerById(userId);
        if (!customer) {
            const newCustomer = await this.customerService.createCustomer({ userId, firstName, lastName, email, addresses: [] } as Customer)
            return res.json(newCustomer);
        }
        res.json(customer);
    }
    addAddress = async (req: Request, res: Response) => {
        const { sub: userId } = req.auth;
        const { customerId } = req.params;
        const newAddress: Address = {
            text: req.body.address,
            isDefault: false
        };
        this.logger.info(`Adding new address for customerId: ${customerId}`, newAddress);
        const customer = await this.customerService.addAddress(customerId, userId, newAddress);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json(customer);
    }
}