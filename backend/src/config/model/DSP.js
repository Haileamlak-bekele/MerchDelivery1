import mongoose from "mongoose";

const dspSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleDetails: {
      type: String,
      required: true,
    },
    drivingLicense: {
      type: String,
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
  },
);

const DSP = mongoose.model("DSP", dspSchema);

export default DSP;
