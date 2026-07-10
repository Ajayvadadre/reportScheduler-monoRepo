import mongoose from "mongoose";

const userSchema = mongoose.Schema({

    email: { type: String },
    password: { type: String }
},
    { timestamps: true }
);

export default mongoose.model('userAuth', userSchema);