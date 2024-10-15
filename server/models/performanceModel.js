import mongoose from "mongoose";

const PerformanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tabId: { type: Number, required: true },
    memoryUsage: { type: Number }, // In MB
    cpuUsage: { type: Number },    // Percentage
    networkUsage: { type: Number }, // KB/s
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Performance', PerformanceSchema);