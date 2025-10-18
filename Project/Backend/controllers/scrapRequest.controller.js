import { addUserRequest, getAllUserRequests, updateUserRequestStatus, deleteUserRequest, getUserRequestById } from "../models/scrapRequest.model.js";  
// import scrapDetails from '../models/scrapDetails.model.js';

export async function addRequest(req, res) {
  console.log("📥 Received request to /api/userRequests/add");
  console.log("Request body:", req.body);
  
  const { name, mobile_No, address, email, pickUp_Date, time_slot, description } = req.body;
  
  try {
    if (!name || !email || !mobile_No || !address || !pickUp_Date || !time_slot || !description ) {
      console.log("❌ Validation failed - missing fields");
      return res.status(400).json({ errors: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Validation failed - invalid email format");
      return res.status(400).json({ errors: "Invalid email format" });
    }

    // Validate mobile number (should be numeric and reasonable length)
    if (!/^\d{10,15}$/.test(mobile_No.toString())) {
      console.log("❌ Validation failed - invalid mobile number");
      return res.status(400).json({ errors: "Mobile number should be 10-15 digits" });
    }

    const userDetails = {
      name,
      email,
      mobile_No,
      address,
      pickUp_Date,
      time_slot,
      description,
      status: "Pending"
    };
    
    console.log("✅ Validation passed, inserting data:", userDetails);
    const userDetail = await addUserRequest(req.db, userDetails);
    console.log("✅ Data inserted successfully, ID:", userDetail);
    
    res.status(200).json({
      message: "User details created successfully",
      id: userDetail
    });
  } catch (error) {
    console.log("❌ Error in addRequest:", error);
    console.log("❌ Error details:", error.message);
    console.log("❌ Error stack:", error.stack);
    res.status(500).json({ 
      error: "Error creating user details",
      details: error.message 
    });
  }
};

export async function getRequests(req, res) {
  try {
    const userRequests = await getAllUserRequests(req.db);
    res.json(userRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching user requests" });
  }
}

export async function updateRequest(req, res) {
  console.log("📥 Received request to update user request");
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);
  
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    if (!status) {
      console.log("❌ Validation failed - status is required");
      return res.status(400).json({ error: "Status is required" });
    }

    // Check if request exists
    const existingRequest = await getUserRequestById(req.db, id);
    if (!existingRequest) {
      console.log("❌ Request not found");
      return res.status(404).json({ error: "Request not found" });
    }

    const affectedRows = await updateUserRequestStatus(req.db, id, status);
    
    if (affectedRows === 0) {
      console.log("❌ No rows affected");
      return res.status(404).json({ error: "Request not found" });
    }
    
    console.log("✅ Request updated successfully");
    res.json({ message: "Request updated successfully" });
  } catch (error) {
    console.log("❌ Error in updateRequest:", error);
    res.status(500).json({ error: "Error updating request" });
  }
}

export async function deleteRequest(req, res) {
  console.log("📥 Received request to delete user request");
  console.log("Request params:", req.params);
  
  const { id } = req.params;
  
  try {
    // Check if request exists
    const existingRequest = await getUserRequestById(req.db, id);
    if (!existingRequest) {
      console.log("❌ Request not found");
      return res.status(404).json({ error: "Request not found" });
    }

    const affectedRows = await deleteUserRequest(req.db, id);
    
    if (affectedRows === 0) {
      console.log("❌ No rows affected");
      return res.status(404).json({ error: "Request not found" });
    }
    
    console.log("✅ Request deleted successfully");
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.log("❌ Error in deleteRequest:", error);
    res.status(500).json({ error: "Error deleting request" });
  }
}