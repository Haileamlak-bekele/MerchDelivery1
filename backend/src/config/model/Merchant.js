import mongoose from "mongoose";

const merchantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeName: {
        type: String,
        required: true,
      },
    location: {
      type: String,
      required: true,
    },
    tradeLicense: {
      type: String,
      required: true,
    },

  },
);

const Merchant = mongoose.model("Merchant", merchantSchema);

export default Merchant;
