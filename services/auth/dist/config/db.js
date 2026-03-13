import mongoose from "mongoose";
const connnecDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "Zomato_Clone",
        });
        console.log("Database connnected successfully");
    }
    catch (error) {
        console.log(error);
    }
};
export default connnecDB;
