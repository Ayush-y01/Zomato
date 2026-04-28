import express  from "express";
import dotenv from 'dotenv'
import connnecDB from "./config/db.js";
import restaurantRoute from "./routes/restaurant.js"
import cors from "cors"
import itemRoutes from "./routes/menuitem.js"
import CartRoutes from "./routes/cart.js"
import addressRouter from "./routes/address.js"
import axios from "axios";
import OrderRoutes from "./routes/order.js"
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startPaymentConsumer } from "./config/payment.consumer.js";

dotenv.config()

await connectRabbitMQ()
startPaymentConsumer()

const app = express()
app.use(cors())
app.use(express.json())


const PORT = process.env.PORT || 5001

app.use("/api/restaurant",restaurantRoute )
app.use("/api/item", itemRoutes)
app.use("/api/cart", CartRoutes)
app.use("/api/address", addressRouter)
app.use("/api/order", OrderRoutes)


app.get("/api/geocode/reverse", async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          format: "json",
          lat,
          lon: lng,
        },
        headers: {
          "User-Agent": "your-app-name",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Geocoding failed" });
  }
});

app.listen(PORT, ()=>{
    console.log(`Restaurant service runnig on ${PORT}`);
    connnecDB()
})