import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import customerRouter from "./customer/customerRouter";
import couponRouter from "./coupon/couponRouter";
import paymentRouter from "./payment/paymentRouter";
import cors from "cors";
import orderRouter from "./order/orderRouter";
import config from "config";

const app = express();
const allowedOrigins: string[] = [
  config.get("frontend.clientUIURL"),
  config.get("frontend.adminUIURL"),
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie", "Cookie", "Idempotency-Key"],
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from order service service!" });
});

app.use("/customer", customerRouter);
app.use("/coupons", couponRouter);
app.use("/orders", orderRouter);
app.use("/payments", paymentRouter);

app.use(globalErrorHandler);

export default app;
