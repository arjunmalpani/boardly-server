import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false, // so password is not returned by default
    },
    socketId: { type: String, index: true, },
    displayName: { type: String, required: true },
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
    avatar: { type: String, default: '' },
    spaces: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Space", // connection to your Space model
        },
    ],
}, { timestamps: true })

userSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);

            user.password = hash;
            next()
        })
    })

})
const User = mongoose.model('User', userSchema);
export default User;