import User from "../model/User.js";
import TryCatch from "../middlewares/trycatch.js";
import jwt from 'jsonwebtoken';
export const loginUser = TryCatch(async (req, res) => {
    const { email, name, picture } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            name,
            email,
            image: picture
        });
    }
    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: "15d" });
    res.status(200).json({
        message: "Logged Succssfully",
        token,
        user
    });
});
