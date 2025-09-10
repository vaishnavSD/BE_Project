import mongoose from "mongoose";

const scrapDetailsSchema = new mongoose.Schema({
  category: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: String, required: true },
  // Uncomment below to include image field
  // image: {
  //   public_id: {
  //     type: String,
  //     required: true,
  //   },
  //   url: {
  //     type: String,
  //     required: true,
  //   }
  // }
});

export const ScrapDetails = mongoose.model("scrapDetails", scrapDetailsSchema);