import { loginSchema, registerSchema } from '../libs/validators.js';
import Blacklist from '../models/blacklist.model.js';
import User from '../models/user.model.js';
import { generateToken, uploadToCloudinary } from '../utils/index.js';
import bcrypt from 'bcrypt';

export const registerController = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error || !value) {
            return res.status(400).json({
                success: false, message: error?.details.map(d => d.message).join(', ') || "Invalid Input"
            });
        }

        // Normalize email and username 
        const username = value.username.trim().toLowerCase();
        const { password, displayName } = value;
        // Check for existing user 
        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already taken' });
        }

        // Try/catch for file upload and deletion

        const newUser = new User({
            username, password, displayName,
        });
        await newUser.save();
        generateToken(newUser._id, res);
        const userToSend = newUser.toObject();
        delete userToSend.password;
        res.status(201).json({
            success: true, message: 'User created Successfully', user: userToSend
        });
        if (req.file) {
            console.time("Cloudinary upload");
            uploadToCloudinary(req.file, "avatars")
                .then(async (url) => {
                    newUser.avatar = url;
                    await newUser.save();
                    console.timeEnd("Cloudinary upload");
                })
                .catch(err => console.error("Avatar upload failed:", err));
        }
    } catch (error) {
        console.error("Error in register controller", error);
        // MISSING: Should return error response in catch block
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
export const loginController = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
        if (error || !value) {
            return res.status(400).json({
                success: false, message: error?.details.map(d => d.message).join(', ') || "Invalid Input"
            });
        }
        const { username, password } = value;


        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false, message: "Invalid Credentials."
            })
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(401).json({
                success: false, message: "Invalid Credentials"
            })
        }

        generateToken(user._id, res);
        const userTosend = user.toObject();
        delete userTosend.password;
        res.status(200).json({
            success: true, message: "Logged in successfully", user: userTosend,
        })

    } catch (error) {
        // Log full error object for better debugging 
        console.error("Error in login controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
export const logoutController = async (req, res) => {
    try {
        const accessToken = req.cookies.token;

        if (!accessToken) {
            return res.sendStatus(204);
        }

        // Check if token is already blacklisted
        const existingToken = await Blacklist.findOne({ token: accessToken });
        if (existingToken) {
            return res.status(204).json({
                success: true,
                message: "Token already invalidated",
            });
        }

        // Add token to blacklist
        await new Blacklist({ token: accessToken }).save();

        // Clear token cookie
        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 0,
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Error in logout controller", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
export const profileController = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select('-password')
        if (!user) {
            return res.status(404).json({
                success: false, message: "User not found"
            })
        }
        const userToSend = user.toObject();
        delete userToSend.password;
        res.status(200).json({
            success: true, message: "Profile Details", user: userToSend,
        })
    } catch (error) {
        console.error('Error in profile controller', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const checkAuthController = async (req, res,) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json(user)
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}