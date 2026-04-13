import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addmenuItem, deleteMenuItem, fetchMenuItem, toggleMenuItemAvailability } from "../controllers/menuitems.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router()


router.post("/new", isAuth, isSeller,uploadFile, addmenuItem)
router.get("/all/:id", isAuth, isSeller, fetchMenuItem)
router.delete("/:itemId", isAuth,isSeller,deleteMenuItem)
router.put("/status/:itemId", isAuth, isSeller, toggleMenuItemAvailability)


export default router