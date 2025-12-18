import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: Number,
    gender: String,
    phone: { type: String, required: true, unique: true },
    vehicleNumber: String,
    password: { type: String, required: true },
    role: { type: String, default: "user" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
