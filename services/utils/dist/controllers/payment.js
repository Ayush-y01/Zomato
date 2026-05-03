import axios from 'axios';
import { razorpay } from '../config/razorpay.js';
import { verifyRazorpaySignature } from '../config/verifyRazorpay.js';
import { publishPaymentSuccess } from '../config/payment.producers.js';
export const createRazorpayorder = async (req, res) => {
    const { orderId } = req.body;
    const { data } = await axios.get(`${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
    });
    const razorpayOrder = await razorpay.orders.create({
        amount: data.amount * 100,
        currency: "INR",
        receipt: orderId
    });
    res.json({
        razorpayOrderId: razorpayOrder.id,
        key: process.env.RAZORPAY_KEY_SECRET,
    });
};
export const verifyRazorpayPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
        return res.status(400).json({
            message: "Payment verification Failed"
        });
    }
    await publishPaymentSuccess({
        orderId,
        paymentId: razorpay_payment_id,
        provider: "razorpay"
    });
    res.json({
        message: "Payment Verified succussfully"
    });
};
