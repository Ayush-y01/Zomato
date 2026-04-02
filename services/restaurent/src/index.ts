import express  from "express";
import dotenv from 'dotenv'
import connnecDB from "./config/db.js";
import restaurantRoute from "./routes/restaurant.js"
import cors from "cors"
import itemRoutes from "./routes/menuitem.js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())


const PORT = process.env.PORT || 5001

app.use("/api/restaurant",restaurantRoute )
app.use("/api/item", itemRoutes)

app.listen(PORT, ()=>{
    console.log(`Restaurant service runnig on ${PORT}`);
    connnecDB()
})