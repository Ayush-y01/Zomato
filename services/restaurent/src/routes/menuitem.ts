import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addmenuItem, deleteMenuItem, fetchMenuItem, toggleMenuItemAvailability } from "../controllers/menuitems.js";

const router = express.Router()


router.post("/new", isAuth, isSeller, addmenuItem)
router.get("/all/:id", isAuth, isSeller, fetchMenuItem)
router.delete("/:id", isAuth,isSeller,deleteMenuItem)
router.delete("/status/:id", isAuth, isSeller, toggleMenuItemAvailability)


export default router