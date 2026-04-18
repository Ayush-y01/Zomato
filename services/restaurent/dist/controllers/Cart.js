import mongoose from "mongoose";
import TryCatch from "../middlewares/trycatch.js";
import Carts from "../models/Carts.js";
export const addToCart = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(404).json({
            message: "Please Login"
        });
    }
    const userId = req.user._id;
    const { restaurantId, itemId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(restaurantId) ||
        !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
            message: "Invalid restaurant and item"
        });
    }
    const cartFromDifferentRestaurant = await Carts.findOne({
        userId,
        restaurantId: { $ne: restaurantId },
    });
    if (cartFromDifferentRestaurant) {
        return res.status(400).json({
            message: "Please Clear your Cart first"
        });
    }
    const cartItem = await Carts.findOneAndUpdate({ userId, restaurantId, itemId }, {
        $inc: { quantity: 1 },
        $setOnInsert: { userId, restaurantId, itemId },
    }, {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true
    });
    return res.json({
        message: "Item added to Cart",
        cart: cartItem,
    });
});
export const fetchCart = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(400).json({
            message: "Please login"
        });
    }
    const userId = req.user._id;
    const cartItems = await Carts.find({ userId }).populate("itemId").populate("restaurantId");
    let subTotal = 0;
    let cartLength = 0;
    for (const cartItem of cartItems) {
        const item = cartItem.itemId;
        subTotal += item.price * cartItem.quantity;
        cartLength += cartItem.quantity;
    }
    return res.json({
        success: true,
        subTotal,
        cartLength,
        cart: cartItems,
    });
});
export const incrementCartItem = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;
    if (!userId || !itemId) {
        return res.status(400).json({
            message: "Invalid Request"
        });
    }
    const cartItem = await Carts.findOneAndUpdate({ userId, itemId }, { $inc: { quantity: 1 } }, { new: true });
    if (!cartItem) {
        return res.status(404).json({
            message: "Item not Found!!! "
        });
    }
    res.json({
        message: "Quantity increased",
        cartItem
    });
});
export const decrementCartItem = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;
    if (!userId || !itemId) {
        return res.status(400).json({
            message: "Invalid Request"
        });
    }
    const cartItem = await Carts.findOne({ userId, itemId });
    if (!cartItem) {
        return res.status(404).json({
            message: "Item not Found!!! "
        });
    }
    if (cartItem.quantity === 1) {
        await Carts.deleteOne({ userId, itemId });
        return res.json({
            message: "Item remove from Cart"
        });
    }
    cartItem.quantity -= 1;
    await cartItem.save();
    res.json({
        message: "Quantity decreased",
        cartItem
    });
});
export const clearCart = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(400).json({
            message: "Unauthorize"
        });
    }
    await Carts.deleteMany({ userId });
    res.json({
        message: "Cart Cleared",
    });
});
