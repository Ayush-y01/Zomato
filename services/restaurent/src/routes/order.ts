import express  from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { creatOrder, fetchOrderForPayment } from "../controllers/order.js";

const router = express.Router()

router.post("/new", isAuth,creatOrder)
router.get("/payment/:id", fetchOrderForPayment)


export default router