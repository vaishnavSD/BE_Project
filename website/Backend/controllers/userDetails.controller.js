import { UserDetails } from "../models/userDetails.model.js";  
// import scrapDetails from '../models/scrapDetails.model.js';

export const addUserDetails = async (req, res) => {
  const { name, email, phone, address, requestedScrap } = req.body;
  try {
    if (!name || !email || !phone || !address || !requestedScrap || !Array.isArray(requestedScrap) || requestedScrap.length === 0) {
      return res.status(400).json({ errors: "All fields are required, including at least one scrap item" });
    }

    // Optionally calculate total_amount here
    let total_amount = 0;
    requestedScrap.forEach(item => {
      total_amount += (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
    });

    const userDetails = {
      name,
      email,
      phone,
      address,
      requestedScrap,
      total_amount: total_amount.toString()
    };
    const userDetail = await UserDetails.create(userDetails);
    res.json({
      message: "User details created successfully",
      userDetail: userDetail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating user details" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const userDetails = await UserDetails.find();
    res.json(userDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching user details" });
  }
};