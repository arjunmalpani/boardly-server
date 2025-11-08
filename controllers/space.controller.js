import Space from "../models/space.model.js";
import User from "../models/user.model.js";

export const createSpaceController = async (req, res) => {
    try {
        const { spaceName } = req.body;
        const hostId = req.userId; // From your auth middleware

        const newSpace = new Space({
            spaceName: spaceName || "Untitled Space",
            host: hostId,
            boardState: null,
        });
        await newSpace.save();
        res.status(201).json(newSpace);
    } catch (error) {
        console.error("Error creating space:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getMySpacesController = async (req, res) => {
    try {
        const userId = req.userId;
        const spaces = await Space.find({ members: userId }).sort({
            updatedAt: -1,
        });
        res.status(200).json(spaces);
    } catch (error) {
        console.error("Error fetching spaces:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getSpaceByIdController = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const space = await Space.findOne({ spaceId });
        if (!space) {
            return res
                .status(404)
                .json({ success: false, message: "Space not found" });
        }

        if (!space.members.includes(req.userId)) {
            return res.status(403).json({
            success: false,
            message: "Not authorized to view this space",
            redirect: "/login",
            });
        }
        // console.dir(spca ,{depth:null});

        res.status(200).json(space);
    } catch (error) {
        console.error("Error fetching space:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const inviteUserToSpaceController = async (req, res) => {
    try {
        const { id: spaceId } = req.params;
        const { username } = req.body;
        const hostId = req.userId;

        // Find the space
        const space = await Space.findOne({ spaceId });
        if (!space) {
            return res
                .status(404)
                .json({ success: false, message: "Space not found" });
        }

        // Check if the requester is the host
        if (space.host.toString() !== hostId) {
            return res.status(403).json({ success: false, message: "Only the host can invite users" });
        }

        // Find the user to invite
        const userToInvite = await User.findOne({ username }).select('_id');
        if (!userToInvite) {
            return res
                .status(404)
                .json({ success: false, message: "User to invite not found" });
        }
        // Chcek if user is already a member
        if (space.members.includes(userToInvite._id)) {
            return res
                .status(400)
                .json({ success: false, message: "User is already a member of the space" });
        }
        // Add user to space members
        space.members.push(userToInvite._id);
        await space.save();
        res.status(200).json({ success: true, message: "User added to space" });
    } catch (error) {
        console.error("Error inviting user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}