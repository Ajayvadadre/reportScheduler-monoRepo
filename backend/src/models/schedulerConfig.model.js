import mongoose from "mongoose";

const schedulerConfigSchema = mongoose.Schema(
    {
        type: { type: String },
        time: { type: String },
        id: { type: String },
        name: { type: String },
        date: { type: Object, default: false },
        uploadType: { type: String, enum: ['aws', 'sftp'], default: 'aws' },
        credentials: { type: Object, default: {} },
        active: { type: Boolean, default: true },
        lastRunAt: { type: Date, default: null },
        lastStatus: { type: String, default: null },
        status: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model("schedulerConfig", schedulerConfigSchema)
