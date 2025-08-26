import { Response } from "express";
import { Request } from "express-jwt";
import { CustomerService } from "./customerService";
import { Customer } from "./customerTypes";
import { Logger } from "winston";

export class CustomerController {
    constructor(private customerService: CustomerService, private logger: Logger) { }
    getCustomer = async (req: Request, res: Response) => {
        const { sub: userId, firstName, lastName, email } = req.auth;
        console.log(req.auth);

        this.logger.info(`Fetching customer for userId: ${userId}`);
        const customer = await this.customerService.getCustomerById(userId);
        if (!customer) {
            const newCustomer = await this.customerService.createCustomer({ userId, firstName, lastName, email, addresses: [] } as Customer)
            return res.json(newCustomer);
        }
        res.json(customer);
    }
}