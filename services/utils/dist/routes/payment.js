import express from "express";
import { createRazorpayorder, verifyRazorpayPayment } from "../controllers/payment.js";
const router = express.Router();
router.post("/create", createRazorpayorder);
router.post("/verify", verifyRazorpayPayment);
export default router;
