import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
const spaceSchema = new mongoose.Schema(
    {
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

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        maxParticipants: {
            type: Number,
            default: 10,
        },
    },
    { timestamps: true , minimize: false }
);
spaceSchema.pre("save", function (next) {
    if (this.isNew && !this.members.includes(this.host)) {
        this.members.push(this.host);
    }
    next();
});

const Space = mongoose.model("Space", spaceSchema);

export default Space;