import axios from "axios";
import FormData from "form-data"; 
import getBuffer from "../config/datauri.js";
import { AuthenticationRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import { Rider } from "../model/Rider.js";

export const addRiderProfile = TryCatch(async(req:AuthenticationRequest, res) => {
    const user = req.user;
    
    if (!user) {
        return res.status(401).json({
            message:"Unauthorized",
        });
    }

    if (user.role !== "rider") {
        return res.status(403).json({
            message:"Only Rider Can create Rider Profile"
        })
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

        const {phoneNumber, aadharNumber, drivingLicense, latitude, longitude} = req.body

        if (!phoneNumber || !aadharNumber || !drivingLicense || latitude === undefined || longitude === undefined) {
            return res.status(404).json({
                message:"All field are Required!!!"
            })
        }

        const existingProfile = await Rider.findOne({
            userId: user._id,
        });

        if (existingProfile) {
            return res.status(400).json({
                message:"Rider Profile Already Exist"
            })
        }

        const riderProfile = await Rider.create({
            userId:user._id,
            picture:uploadResult.url,
            phoneNumber,
            aadharNumber,
            drivingLicense,
            location:{
                type:"Point",
                coordinates:[longitude, latitude]
            },
            isAvailable:false,
            isVerified:false,
        });

        return res.status(200).json({
            message:"Rider Profile Created !!!"
        })

})

export const fetchMyProfile = TryCatch(async(req:AuthenticationRequest, res) => {
    const user = req.user;
    
    if (!user) {
        return res.status(401).json({
            message:"Unauthorized",
        });
    }

    const account = await Rider.findOne({userId: user._id});

    res.json(account);
});

export const toggleAvailbility = TryCatch(async(req:AuthenticationRequest, res) => {
    const user = req.user;
    
    if (!user) {
        return res.status(401).json({
            message:"Unauthorized",
        });
    }

    if (user.role !== "rider") {
        return res.status(403).json({
            message:"Only Rider Can create Rider Profile"
        })
    }

    const {isAvailable, latitude, longitude} = req.body;

    if (typeof isAvailable !== "boolean") {
        return res.status(400).json({
            message:"isAvailbale Must True or False"
        })
    }

    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            message:"Location are required"
        })
    }

    const rider = await Rider.findOne({userId: user._id})
    
    if (!rider) {
        return res.status(404).json({
            message:"rider Profile not found"
        })
    }

    if (isAvailable && !rider.isVerified)  {
        return res.status(403).json({
            message:"Rider is not verified"
        })
    }

    rider.isAvailable = isAvailable

    rider.location = {
        type:"Point",
        coordinates:[longitude, latitude]
    }
    rider.lastActiveAt = new Date();

    await rider.save()

    res.json({
        message: isAvailable ? "Rider is Now Online" : "Rider is Now Offline",
        rider,
    })
})