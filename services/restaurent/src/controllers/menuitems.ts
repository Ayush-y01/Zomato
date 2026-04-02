import axios from "axios";
import { AuthenticationRequest } from "../middlewares/isAuth.js";
import FormData from "form-data";
import TryCatch from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";
import MenuItems from "../models/MenuItems.js";


export const addmenuItem = TryCatch(async(req:AuthenticationRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message:"Please login"
        })
    }

    const restaurant = await Restaurant.findOne({ownerId:req.user})

    if (!restaurant) {
        return res.status(404).json({
            message: "There is No restaurant found"
        })
    }

    const {name, description,price} = req.body

    if (!name || !price) {
        return res.status(400).json({
            message: "Name And price is required"
        })
    }

    const file = req.file

    if (!file) {
            return res.status(400).json({
                message: "Please upload an image",
            });
        }
    
        let uploadResult;
    
        try {
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
            console.log(" UPLOAD SERVICE ERROR:", error?.response?.data || error.message);
    
            return res.status(500).json({
                message: "Image upload failed",
                error: error?.response?.data || error.message,
            });
        }

        const item = await MenuItems.create({
            name,
            description,
            price,
            restaurantId: restaurant._id,
            image:uploadResult.url
        })

        res.json({
            message:"Item Added Successfully",
            item
        })
})

export const fetchMenuItem = TryCatch(async(req:AuthenticationRequest, res) => {
    const {id} = req.params;

    if (!id) {
        return res.status(400).json({
            message: "id is Required"
        })
    }

    const items = await MenuItems.find({restaurantId:id})

    res.json(items )
})


export const deleteMenuItem = TryCatch(async(req:AuthenticationRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message:"Please login"
        })
    }

    const {itemId} = req.params;

    if (!itemId) {
        return res.status(400).json({
            message: "id is Required"
        })
    }

    const item = await MenuItems.findById(itemId)

    if (!item) {
        return res.status(404).json({
            message:"No item Found"
        })
    }

    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id
    })

    if (!restaurant) {
        return res.status(404).json({
            message:"No restaurant Found"
        })
    }

    await item.deleteOne()

    res.json({
        message: "Menu Item Deleted succssfully",
    })

})


export const toggleMenuItemAvailability = TryCatch(async(req:AuthenticationRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message:"Please login"
        })
    }

    const {itemId} = req.params;

    if (!itemId) {
        return res.status(400).json({
            message: "id is Required"
        })
    }

    const item = await MenuItems.findById(itemId)

    if (!item) {
        return res.status(404).json({
            message:"No item Found"
        })
    }

    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id
    })

    if (!restaurant) {
        return res.status(404).json({
            message:"No restaurant Found"
        })
    }

    item.isAvailable = !item.isAvailable
    await item.save()

    res.json({
        message:`Item Marked As ${item.isAvailable ? "Available" : "Unavailable"}`,
        item,
    })
})