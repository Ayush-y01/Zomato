import express from "express";
import dotenv from 'dotenv';
import connnecDB from "./config/db.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Auth service runnig on ${PORT}`);
    connnecDB();
});
