import { verifyToken } from '../utils/authUtils.js';
import { errorResponse } from '../utils/response.js';
import prisma from '../config/database.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'No token provided', [], 401);
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 'Invalid or expired token', [], 401);
    }

    // Verify admin exists in database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin) {
      return errorResponse(res, 'Admin not found', [], 401);
    }

    req.admin = admin;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication error', [], 500);
  }
};
