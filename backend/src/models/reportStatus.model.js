import mongoose from "mongoose";

const reportStatusSchema = mongoose.Schema(
    {
        status: { type: String },
        message: { type: String },
        type: { type: String },
        scheduleTime: { type: String },
        name: { type: String }

    },
    { timestamps: true }
);

export default mongoose.model('reportStatus', reportStatusSchema)
