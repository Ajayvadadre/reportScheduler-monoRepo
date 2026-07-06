import mongoose from "mongoose";

const reportDataSchema = mongoose.Schema(
    {
        agentName: { type: String },
        callInitiated: { type: String },
        callEnded: { type: String },
        callDuration: { type: String },
        customerName: { type: String },
        location: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model("reportData", reportDataSchema);