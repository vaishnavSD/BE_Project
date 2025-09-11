import { addUserRequest,getAllUserRequests} from "../models/scrapRequest.model.js";  
// import scrapDetails from '../models/scrapDetails.model.js';

export async function addRequest(req, res) {
  const { name, mobile_No, address, email, pickUp_Date, time_slot, description,status,id } = req.body;
  try {
    if (!name || !email || !mobile_No || !address || !pickUp_Date || !time_slot || !description ) {
      return res.status(400).json({ errors: "All fields are required" });
    }

    // Optionally calculate total_amount here
    const status="Pending"
    const userDetails = {
      name,
      email,
      mobile_No,
      address,
      pickUp_Date,
      time_slot,
      description,
      status,
      id

      
    };
    const userDetail = await addUserRequest(req.db, userDetails);
    res.json({
      message: "User details created successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating user details" });
  }
};

export async function getRequests(req, res) {
  try {
    const userRequests = await getAllUserRequests(req.db);
    res.json(userRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching scrap details" });
  }
}