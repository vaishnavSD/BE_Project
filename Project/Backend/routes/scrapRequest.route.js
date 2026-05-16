import express from 'express';

import { 
  addRequest, 
  getRequests, 
  updateRequest, 
  deleteRequest,
  callAgentApproveRequest,
  agentAcceptRequest,
  getApprovedRequests,
  getCallAgentRequests,
  getAgentPendingPickups,
  markAsCollected
} from '../controllers/scrapRequest.controller.js';
const router = express.Router();

router.post("/add", addRequest);
router.get("/get", getRequests);
router.get("/approved", getApprovedRequests);
router.get("/call-agent/:callAgentId", getCallAgentRequests);
router.get("/agent/:agentId/pending", getAgentPendingPickups);
router.put("/:id", updateRequest);
router.put("/:id/call-agent-approve", callAgentApproveRequest);
router.put("/:id/agent-accept", agentAcceptRequest);
router.put("/:id/collect", markAsCollected);
router.delete("/:id", deleteRequest);

export default router;
