import mongoose from "mongoose";

const TabSchema = new mongoose.Schema({
    url: String,
    title: String,
    active: Boolean,
    lastAccessed: Date
});

const SessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, // Added the 'name' field here
    tabs: [TabSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});

export default mongoose.model('Session', SessionSchema);
