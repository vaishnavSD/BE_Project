import { ScrapDetails } from '../models/scrapDetails.model.js';
import { v2 as cloudinary } from "cloudinary";


export const addDetails = async (req, res) => {
  const { category, type, price } = req.body; // removed `image` from here
  console.log(category, type, price);

  try {
    // Validate required text fields
    if (!category || !type || !price) {
      return res.status(400).json({ errors: "All fields are required" });
    }

    // // Validate file upload
    // if (!req.files || Object.keys(req.files).length === 0) {
    //   return res.status(400).json({ errors: "No file uploaded" });
    // }

    // const {image} = req.files; // get image from uploaded files

    // // Check allowed formats
    // const allowedFormat = ["image/png", "image/jpeg"];
    // if (!allowedFormat.includes(image.mimetype)) {
    //   return res
    //     .status(400)
    //     .json({ errors: "Invalid file format. Only PNG and JPG are allowed" });
    // }

    // // Upload to Cloudinary
    // const cloud_response = await cloudinary.uploader.upload(image.tempFilePath);
    // if (!cloud_response || cloud_response.error) {
    //   return res
    //     .status(400)
    //     .json({ errors: "Error uploading file to cloudinary" });
    // }

    // Save to database
    const details = {
      category,
      type,
      price,
      // image: {
      //   public_id: cloud_response.public_id,
      //   url: cloud_response.url,
      // },
    };

    const scrapDetail = await ScrapDetails.create(details);
    res.json({
      message: "Scrap detail created successfully",
      scrapDetail,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating scrap detail" });
  }
};


export const getDetails = async (req, res) => {
  try {
    const scrapDetails = await ScrapDetails.find();
    res.json(scrapDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching scrap details" });
  }
};

export const deleteDetails = async (req, res) => {
  const { id } = req.params;                    
  try {
    const scrapDetail = await ScrapDetails.findByIdAndDelete(id);
    if (!scrapDetail) {
      return res.status(404).json({ error: "Scrap detail not found" });
    }
    res.json({ message: "Scrap detail deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting scrap detail" });
  }
};
