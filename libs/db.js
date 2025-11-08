import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "boardly",
        });
        console.log("[DATABASE] SUCCESS Connected to MongoDB");
    } catch (error) {
        console.error("[DATABASE] FAILED Connection to MongoDB ", error.message);
        process.exit(1);
    }
};