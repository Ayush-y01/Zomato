import TryCatch from "../middlewares/trycatch.js";
import Address from "../models/address.js";
export const addAddress = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "UnAuthroized"
        });
    }
    const { mobile, formattedAddress, latitude, longitude } = req.body;
    if (!mobile || !formattedAddress || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            message: "All the field are required"
        });
    }
    const newAddress = await Address.create({
        userId: user._id.toString(),
        mobile: Number(mobile),
        formattedAddress,
        location: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)]
        }
    });
    res.json({
        message: "Address Added successfullyy",
        address: newAddress,
    });
});
export const deleteAddress = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "UnAuthroized"
        });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            message: "ID is required.."
        });
    }
    const address = await Address.findOne({
        _id: id,
        userId: user._id.toString()
    });
    if (!address) {
        return res.status(404).json({
            message: "Address not found"
        });
    }
    await address.deleteOne();
    res.json({
        message: "Address Deleted succssfully"
    });
});
export const getAddress = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "UnAuthroized"
        });
    }
    const addresses = await Address.find({
        userId: user._id.toString()
    }).sort({ createdAt: -1 });
    res.json({
        addresses
    });
});
