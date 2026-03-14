import User from "../model/User.js";
import TryCatch from "../middlewares/trycatch.js";
import jwt, { TokenExpiredError } from 'jsonwebtoken'
import { AuthenticationRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from "axios";

export const loginUser = TryCatch(async (req, res) => {
    const {code} = req.body;

    if (!code) {
        return res.status(400).json({
            message:"Authorization code is required"
        })
    }

    const googleRes = await oauth2client.getToken(code)

    oauth2client.setCredentials(googleRes.tokens)

    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)

    const { email, name, picture } = userRes.data

    let user = await User.findOne({ email })

    if (!user) {
        user = await User.create({
            name,
            email,
            image: picture
        })
    }

    const token = jwt.sign({ user }, process.env.JWT_SECRET as string, { expiresIn: "15d" })

    res.status(200).json({
        message:"Logged Succssfully",
        token,
        user
    })
})

const allowedRoles = ["customer", "rider", "seller"] as const;
type Role = (typeof allowedRoles)[number];


export const addUserRole = TryCatch(async(req: AuthenticationRequest, res) => {
    if (!req.user?._id) {
        return res.status(401).json({
            message:"Unauthorized"
        })
    }


    const { role } = req.body as {role: Role};

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: "Invalid Role"
        })
    }

    const user = await User.findByIdAndUpdate(req.user._id, {role}, {new:true})

    if (!user) {
        return res.status(404).json({
            message: "User Not Found!!!"
        })
    }

    const token = jwt.sign({ user }, process.env.JWT_SECRET as string, { expiresIn: "15d" })

    res.json({ user, token })
})

export const myProfile = TryCatch(async(req:AuthenticationRequest, res)=> {
    const user = req.user

    res.json(user)
})