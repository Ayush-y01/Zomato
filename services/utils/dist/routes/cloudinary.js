import express from "express";
import multer from "multer";
import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();
// ✅ Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });
// ✅ ImageKit setup
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});
// 🚀 Upload route
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        console.log("📥 File received:", !!req.file);
        console.log("📦 File size:", req.file?.size);
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }
        const result = await imagekit.upload({
            file: req.file.buffer, // ✅ direct buffer (no base64 needed)
            fileName: req.file.originalname,
        });
        console.log("✅ Upload success:", result.url);
        res.json({
            url: result.url,
        });
    }
    catch (error) {
        console.log("🔥 IMAGEKIT ERROR:", error);
        res.status(500).json({
            message: "Upload failed",
            error: error.message,
        });
    }
});
export default router;
