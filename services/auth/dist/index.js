import express from "express";
import dotenv from 'dotenv';
import connnecDB from "./config/db.js";
import authRoute from "./routes/auth.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/auth", authRoute);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Auth service runnig on ${PORT}`);
    connnecDB();
});
