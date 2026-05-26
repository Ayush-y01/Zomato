import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import { fetchMyProfile, toggleRiderAvailbility } from "../controllers/rider.js"

const router = express.Router()

router.get("/myprofile", isAuth, fetchMyProfile)
router.patch("/toggle",isAuth,toggleRiderAvailbility )


export default router