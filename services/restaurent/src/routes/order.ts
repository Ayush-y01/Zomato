import express  from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { creatOrder, fetchOrderForPayment, fetchRestaurantOrders, fetchSingleOrder, getMyOrders, updateOrderStatus } from "../controllers/order.js";

const router = express.Router()

router.get("/myorder", isAuth,getMyOrders)
router.get("/:id", isAuth,fetchSingleOrder)

router.post("/new", isAuth,creatOrder)
router.get("/payment/:id", fetchOrderForPayment)
router.get("/restaurant/:restaurantId",isAuth, isSeller, fetchRestaurantOrders)
router.put("/:orderId",isAuth, isSeller, updateOrderStatus)



export default router