import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  address: { type: String, required: true },

  // Store requested scrap items as an array
  requestedScrap: [
    {
      category: { type: String, required: true },
      type: { type: String, required: true },
      price: { type: String, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  total_amount: { type: String },
  date: { type: Date, default: Date.now },

});

export const UserDetails = mongoose.model("UserDetails", userDetailsSchema);
