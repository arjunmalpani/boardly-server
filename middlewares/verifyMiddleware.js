import jwt from "jsonwebtoken";
import Blacklist from "../models/blacklist.model.js";
import "dotenv/config";

export async function verifyMiddleware(req, res, next) {
    try {
        const accessToken = req.cookies.token;
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorised - Access Denied"
            })
        }

        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
        if (checkIfBlacklisted) {
            return res.status(401).json({
                success: false,
                message: "This session is expired. Please re-login"
            })
        }
        jwt.verify(accessToken, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "403 - Forbidden"
                })
            }
            const { userId } = decoded;
            req.userId = userId || null;
            next();
        }
        )
    } catch (error) {
        console.error('Error in Verification Middleware', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}