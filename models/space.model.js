import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const messageSchema = new mongoose.Schema({
    id: { type: String, required: true },
    text: { type: String, required: true },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    senderName: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const spaceSchema = new mongoose.Schema({
    spaceId: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4(),
        index: true,
    },
    spaceName: {
        type: String,
        required: true,
        default: "Untitled Board",
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    boardState: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    maxParticipants: {
        type: Number,
        default: 10,
    },
    messages: [messageSchema],
},
    { timestamps: true, minimize: false }
);
spaceSchema.pre("save", function (next) {
    if (this.isNew && !this.members.includes(this.host)) {
        this.members.push(this.host);
    }
    next();
});

const Space = mongoose.model("Space", spaceSchema);

export default Space;