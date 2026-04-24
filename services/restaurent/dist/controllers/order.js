import TryCatch from "../middlewares/trycatch.js";
import Address from "../models/address.js";
import Carts from "../models/Carts.js";
import Restaurant from "../models/Restaurant.js";
export const creatOrder = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    const { paymentMethod, addressId } = req.body;
    if (!addressId) {
        return res.status(400).json({
            message: "address is required!!"
        });
    }
    const address = await Address.findOne({
        _id: addressId,
        userId: user._id
    });
    if (!address) {
        return res.status(404).json({
            message: "Address Not Found!!!!"
        });
    }
    const cartItems = await Carts.find({
        userId: user._id
    }).populate("itemId").populate("restaurantId");
    if (cartItems.length === 0) {
        return res.status(400).json({
            message: "Cart is Empty"
        });
    }
    const firstCartItem = cartItems[0];
    if (!firstCartItem || !firstCartItem.restaurantId) {
        return res.status(400).json({
            message: "Invalid Cart Data"
        });
    }
    const restaurantId = firstCartItem.restaurantId._id;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return res.status(404).json({
            message: "No restaurant found with this id"
        });
    }
    if (!restaurant.isOpen) {
        return res.status(404).json({
            message: "Sorry this is restaurant is closed!!!!"
        });
    }
    let subtotal = 0;
    const orderItems = cartItems.map((cart) => {
        const item = cart.itemId;
        if (!item) {
            throw new Error("Invalid Cart Item");
        }
        const itemTotal = item.price * cart.quantity;
        subtotal += itemTotal;
        return {
            itemId: item._id.toString(),
            name: item.name,
            price: item.price,
            quantity: cart.quantity,
        };
    });
    const deliveryFee = subtotal < 250 ? 49 : 0;
    const platfromFee = 7;
    const totalAmount = subtotal + deliveryFee + platfromFee;
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);
});
