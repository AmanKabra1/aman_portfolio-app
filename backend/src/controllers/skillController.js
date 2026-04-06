import { successResponse, errorResponse } from '../utils/response.js';
import {
  createSkill,
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
} from '../services/skillService.js';

export const create = async (req, res, next) => {
  try {
    const skill = await createSkill(req.body);
    return successResponse(res, 'Skill created successfully', skill, 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const skills = await getAllSkills();
    return successResponse(res, 'Skills retrieved successfully', skills);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const skill = await getSkillById(parseInt(req.params.id));

    if (!skill) {
      return errorResponse(res, 'Skill not found', [], 404);
    }

    return successResponse(res, 'Skill retrieved successfully', skill);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const skill = await updateSkill(parseInt(req.params.id), req.body);
    return successResponse(res, 'Skill updated successfully', skill);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Skill not found', [], 404);
    }
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteSkill(parseInt(req.params.id));
    return successResponse(res, 'Skill deleted successfully', null);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Skill not found', [], 404);
    }
    next(error);
  }
};
