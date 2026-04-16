import express  from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { addToCart, fetchCart } from "../controllers/cart.js";

const router = express.Router()


router.post("/add",isAuth, addToCart);
router.get("/all",isAuth, fetchCart);

export default router;