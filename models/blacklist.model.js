import mongoose from "mongoose"

const blackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        ref: 'User',
    }
}, { timestamps: true });

const Blacklist = mongoose.model('blacklist', blackListSchema);
export default Blacklist;