import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("Auth Middleware Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
}

export function restrictTo(...roles) {
  return (req, res, next) => {
    // Roles are passed in the JWT usually, ensure req.user has it
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access Denied: You do not have permission to perform this action." });
    }
    next();
  };
}
