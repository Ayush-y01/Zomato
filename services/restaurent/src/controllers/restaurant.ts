import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticationRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import restaurant from "../models/Restaurant.js";
import Restaurant from "../models/Restaurant.js";
import jwt from "jsonwebtoken";
 

export const addRestaurant = TryCatch(async(req:AuthenticationRequest, res) => {
    const user = req.user

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        })
    }

    const existingRestaurant = await restaurant.findOne({
        ownerId: user._id,
    })
    if (existingRestaurant) {
        return res.status(400).json({
            message:"you are already Have a restaurant"
        })
    }


    const {name, description, latitude, longitude, formatedAddress, phone} = req.body

    if (!name || !latitude || !longitude ) {
        res.status(400).json({
            message: "Please give all the details"
        })
    }

    const file = req.body

    if (!file) {
        res.status(400).json({
            message: "Please give Image"
        })
    }
    
    const fileBuffer = getBuffer(file)

    if (!fileBuffer?.content) {
        res.status(500).json({
            message: "Failed to create file buffer"
        })
    }

    const {data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`,{
        buffer:fileBuffer.content,
    })

    const Restaurant = await restaurant.create({
        name,
        description,
        phone,
        image:uploadResult,
        ownerId:user._id,
        autoLocation: {
            type:"Point",
            coordinates:[Number(longitude), Number(latitude)],
            formatedAddress,
        }
    });

    return res.status(201).json({
        message: "Restaurant created successfully"
    })
})

export const fetchMyRestaurant = TryCatch(async(req:AuthenticationRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login First!!!"
        })
    }

    const restaurant = await Restaurant.findOne({ownerId: req.user._id })

    if (!restaurant) {
        return res.status(404).json({
            message:"No Restaurant Found!!"
        })
    }

    if (!req.user.restaurantId) {
        const token = jwt.sign({
            user:{
                ...req.user,
                restaurantId: restaurant._id,
            }
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "15d",
        }
    );
    return res.json({
        restaurant, token
    })
    }

    res.json({restaurant})
})
