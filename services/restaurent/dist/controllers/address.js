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
        mobile,
        formattedAddress,
        location: {
            type: "point",
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
});
