import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import uploadRoutes from "./routes/cloudinary.js"; // (we’ll rename later if you want)
import { connectRabbitMQ } from "./config/rabbitmq.js";
import PaymentRouter from './routes/payment.js';
dotenv.config();
connectRabbitMQ();
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT, } = process.env;
console.log(" ImageKit Config:", {
    publicKey: IMAGEKIT_PUBLIC_KEY ? "EXISTS" : "MISSING",
    privateKey: IMAGEKIT_PRIVATE_KEY ? "EXISTS" : "MISSING",
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});
if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    throw new Error("Missing ImageKit env variables");
}
app.use("/api", uploadRoutes);
app.use("/api/payment", PaymentRouter);
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`🚀 Utils service running on ${PORT}`);
});
