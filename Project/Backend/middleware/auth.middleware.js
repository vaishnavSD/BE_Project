// Authentication middleware to protect routes

export const requireAuth = (req, res, next) => {
  // For now, check if user info is in headers (will be replaced with JWT)
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  
  if (!userId || !userRole) {
    return res.status(401).json({ 
      error: "Authentication required",
      message: "Please provide valid credentials" 
    });
  }
  
  // Attach user info to request
  req.user = {
    id: parseInt(userId),
    role: userRole
  };
  
  next();
};

// Role-based authorization middleware
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Authentication required" 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "Forbidden",
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}` 
      });
    }
    
    next();
  };
};

// Optional auth - doesn't fail if no auth provided
export const optionalAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  
  if (userId && userRole) {
    req.user = {
      id: parseInt(userId),
      role: userRole
    };
  }
  
  next();
};
