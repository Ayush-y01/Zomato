import axios from "axios";
import FormData from "form-data";
import TryCatch from "../middlewares/trycatch.js";
import RestaurantModel from "../models/Restaurant.js";
import jwt from "jsonwebtoken";
export const addRestaurant = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const existingRestaurant = await RestaurantModel.findOne({
        ownerId: user._id,
    });
    if (existingRestaurant) {
        return res.status(400).json({
            message: "You already have a restaurant",
        });
    }
    const { name, description, latitude, longitude, phone } = req.body;
    let formattedAddress = "Address not available";
    try {
        const geoRes = await axios.get("https://nominatim.openstreetmap.org/reverse", {
            params: {
                lat: latitude,
                lon: longitude,
                format: "json",
            },
            headers: {
                "User-Agent": "restaurant-app",
            },
        });
        formattedAddress = geoRes.data.display_name || "Address not available";
    }
    catch (error) {
        console.log("Geo error:", error.message);
    }
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
        const formData = new FormData();
        formData.append("file", file.buffer, file.originalname);
        const response = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`, formData, {
            headers: formData.getHeaders(),
        });
        uploadResult = response.data;
    }
    catch (error) {
        console.log(" UPLOAD SERVICE ERROR:", error?.response?.data || error.message);
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
export const fetchMyRestaurant = TryCatch(async (req, res) => {
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
        const token = jwt.sign({
            user: {
                ...req.user,
                restaurantId: restaurant._id,
            },
        }, process.env.JWT_SECRET, {
            expiresIn: "15d",
        });
        return res.json({
            restaurant,
            token,
        });
    }
    return res.json({ restaurant });
});
export const updateStatusRestaurant = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login"
        });
    }
    const { status } = req.body;
    if (typeof status !== "boolean") {
        return res.status(400).json({
            message: "Status must be boolean"
        });
    }
    const restaurant = await RestaurantModel.findOneAndUpdate({ ownerId: req.user._id, }, { isOpen: status }, { returnDocument: 'after' });
    if (!restaurant) {
        return res.status(404).json({
            message: "Restaurant not found"
        });
    }
    res.json({
        message: "Restaurant Status Updated",
        restaurant,
    });
});
export const updateRestaurant = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login"
        });
    }
    const { name, description } = req.body;
    const restaurant = await RestaurantModel.findOneAndUpdate({ ownerId: req.user._id }, { name: name, description: description }, { returnDocument: 'after' });
    if (!restaurant) {
        return res.status(404).json({
            message: "Restaurant not found"
        });
    }
    res.json({
        message: "Restaurant Updated",
        restaurant,
    });
});
export const getNearByRestaurant = TryCatch(async (req, res) => {
    const { latitude, longitude, radius = 5000, search = "" } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({
            message: "latitude and longitude is required",
        });
    }
    const query = {
        isVerified: true,
    };
    if (search && typeof search === "string") {
        query.name = { $regex: search, $options: "i" };
    }
    const restaurants = await RestaurantModel.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [Number(longitude), Number(latitude)],
                },
                distanceField: "distance",
                maxDistance: Number(radius),
                spherical: true,
                key: "autoLocation",
                query,
            },
        },
        {
            $sort: {
                isOpen: -1,
                distance: 1,
            },
        },
        {
            $addFields: {
                distanceKm: {
                    $round: [{ $divide: ["$distance", 1000] }, 2],
                },
            },
        },
    ]);
    res.json({
        success: true,
        count: restaurants.length,
        restaurants,
    });
});
export const fetchSingleRestaurant = TryCatch(async (req, res) => {
    const restaurant = await RestaurantModel.findById(req.params.id);
    res.json(restaurant);
});
