import { successResponse, errorResponse } from '../utils/response.js';
import { loginAdmin, getAdminById } from '../services/authService.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await loginAdmin(email, password);

    return successResponse(res, 'Login successful', result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return errorResponse(res, 'Invalid email or password', [], 401);
    }
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const admin = await getAdminById(req.admin.id);

    if (!admin) {
      return errorResponse(res, 'Admin not found', [], 404);
    }

    return successResponse(res, 'Admin retrieved successfully', admin);
  } catch (error) {
    next(error);
  }
};
