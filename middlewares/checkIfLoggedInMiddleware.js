import jwt from "jsonwebtoken";
import Blacklist from "../models/blacklist.model.js";

export const checkIfLoggedInMiddleware = async (req, res, next) => {
    try {
        const { token: accessToken } = req.cookies
        if (!accessToken) return next();

        const checkIfBlacklist = await Blacklist.findOne({ token: accessToken });
        if (checkIfBlacklist) return next();

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next();
            return res.status(400).json({
                success: false,
                message: "It seems like you are already logged in!"
            })

        })
    } catch (error) {
        console.error('Error in checkIfAlreadyLoggedIn Middleware', error);
        next();
    }
}
