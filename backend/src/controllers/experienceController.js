import { successResponse, errorResponse } from '../utils/response.js';
import {
  createExperience,
  getAllExperience,
  getExperienceById,
  updateExperience,
  deleteExperience,
} from '../services/experienceService.js';

export const create = async (req, res, next) => {
  try {
    const experience = await createExperience(req.body);
    return successResponse(res, 'Experience created successfully', experience, 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const experience = await getAllExperience();
    return successResponse(res, 'Experience retrieved successfully', experience);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const experience = await getExperienceById(parseInt(req.params.id));

    if (!experience) {
      return errorResponse(res, 'Experience not found', [], 404);
    }

    return successResponse(res, 'Experience retrieved successfully', experience);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const experience = await updateExperience(parseInt(req.params.id), req.body);
    return successResponse(res, 'Experience updated successfully', experience);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Experience not found', [], 404);
    }
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteExperience(parseInt(req.params.id));
    return successResponse(res, 'Experience deleted successfully', null);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Experience not found', [], 404);
    }
    next(error);
  }
};
