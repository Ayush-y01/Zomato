import axios from "axios";
import FormData from "form-data"; // ✅ IMPORTANT
import { AuthenticationRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import RestaurantModel from "../models/Restaurant.js";
import jwt from "jsonwebtoken";

export const addRestaurant = TryCatch(async (req: AuthenticationRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    // 🔍 Check existing restaurant
    const existingRestaurant = await RestaurantModel.findOne({
        ownerId: user._id,
    });

    if (existingRestaurant) {
        return res.status(400).json({
            message: "You already have a restaurant",
        });
    }

    const { name, description, latitude, longitude, formattedAddress, phone } = req.body;

    if (!name || !latitude || !longitude) {
        return res.status(400).json({
            message: "Please provide all required details",
        });
    }

    const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "Please upload an image",
            });
        }

        let uploadResult;

        try {
            // ✅ SEND FILE AS FORM DATA (NO base64, NO getBuffer)
            const formData = new FormData();
            formData.append("file", file.buffer, file.originalname);

            const response = await axios.post(
                `${process.env.UTILS_SERVICE}/api/upload`,
                formData,
                {
                    headers: formData.getHeaders(),
                }
            );

            uploadResult = response.data;

        } catch (error: any) {
            console.log("🔥 UPLOAD SERVICE ERROR:", error?.response?.data || error.message);

            return res.status(500).json({
                message: "Image upload failed",
                error: error?.response?.data || error.message,
            });
        }


    const newRestaurant = await RestaurantModel.create({
        name,
        description,
        phone,
        image: uploadResult.url,
        ownerId: user._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress,
        },
        isVerified: false,
    });

    return res.status(201).json({
        message: "Restaurant created successfully",
        restaurant: newRestaurant,
    });
});


// ================= FETCH =================

export const fetchMyRestaurant = TryCatch(async (req: AuthenticationRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please login first",
        });
    }

    const restaurant = await RestaurantModel.findOne({
        ownerId: req.user._id,
    });

    if (!restaurant) {
        return res.status(404).json({
            message: "No restaurant found",
        });
    }

    if (!req.user.restaurantId) {
        const token = jwt.sign(
            {
                user: {
                    ...req.user,
                    restaurantId: restaurant._id, // ✅ FIXED
                },
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "15d",
            }
        );

        return res.json({
            restaurant,
            token,
        });
    }

    return res.json({ restaurant });
});

export const updateStatusRestaurant = TryCatch(async (req: AuthenticationRequest, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login"
        })
    }


    const {status} = req.body

    if (typeof status !== "boolean") {
        return res.status(400).json({
            message: "Status must be boolean"
        })
    }
    const restaurant = await RestaurantModel.findOneAndUpdate(
        { ownerId: req.user._id,},
        {isOpen: status},
        {new: true}    
    )

    if (!restaurant) {
        return res.status(404).json({
            message: "Restaurant not found"
        })
    }

    res.json({
        message: "Restaurant Status Updated",
        restaurant,
    })
} )


export const updateRestaurant = TryCatch(async(req: AuthenticationRequest, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login"
        })
    }

    const {name, description}= req.body

    const restaurant = await RestaurantModel.findOneAndUpdate(
        {ownerId: req.user._id},
        {name: name, description:description},
        {new: true}
    )
    if (!restaurant) {
        return res.status(404).json({
            message: "Restaurant not found"
        })
    }

    res.json({
        message: "Restaurant Updated",
        restaurant,
    })
})