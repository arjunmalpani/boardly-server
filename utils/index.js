import jwt from 'jsonwebtoken';
import fs from "fs/promises";
import cloudinary from "../configs/cloudinary.js";
export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.cookie('token', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // prevent XSS
        sameSite: "strict", // prevent CFRS
        secure: process.env.NODE_ENV === "production"
    })
};

export const uploadToCloudinary = async (file, folder = "images") => {
    if (!file || !file.path) return null;
    try {
        const fileData = await fs.readFile(file.path, { encoding: 'base64' });
        const mimeType = file.mimetype;
        const base64String = `data:${mimeType};base64,${fileData}`;
        const uploadResult = await cloudinary.uploader.upload(base64String, {
            folder: folder, format: "webp"
        });
        return uploadResult.secure_url ?? "";
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message);
        throw new Error("Failed to upload file");
    } finally {
        try {
            await fs.unlink(file.path);
        } catch (error) {
            console.error("Error deleting temp file:", error);
        }
    }
};