import { successResponse, errorResponse } from '../utils/response.js';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../services/projectService.js';

export const create = async (req, res, next) => {
  try {
    const project = await createProject(req.body);
    return successResponse(res, 'Project created successfully', project, 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const projects = await getAllProjects();
    return successResponse(res, 'Projects retrieved successfully', projects);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const project = await getProjectById(parseInt(req.params.id));

    if (!project) {
      return errorResponse(res, 'Project not found', [], 404);
    }

    return successResponse(res, 'Project retrieved successfully', project);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const project = await updateProject(parseInt(req.params.id), req.body);
    return successResponse(res, 'Project updated successfully', project);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Project not found', [], 404);
    }
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteProject(parseInt(req.params.id));
    return successResponse(res, 'Project deleted successfully', null);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Project not found', [], 404);
    }
    next(error);
  }
};
