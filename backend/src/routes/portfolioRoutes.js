import express from 'express';
import * as portfolioController from '../controllers/portfolioController.js';
import * as skillController from '../controllers/skillController.js';
import * as projectController from '../controllers/projectController.js';
import * as experienceController from '../controllers/experienceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  validateCreateSkill,
  validateUpdateSkill,
  validateSkillId,
  handleValidationErrors as skillValidationErrors,
} from '../validators/skillValidators.js';
import {
  validateCreateProject,
  validateUpdateProject,
  validateProjectId,
  handleValidationErrors as projectValidationErrors,
} from '../validators/projectValidators.js';
import {
  validateCreateExperience,
  validateUpdateExperience,
  validateExperienceId,
  handleValidationErrors as experienceValidationErrors,
} from '../validators/experienceValidators.js';
import {
  validateUpdateAbout,
  validateUpdateContact,
  handleValidationErrors as aboutContactValidationErrors,
} from '../validators/aboutContactValidators.js';

const router = express.Router();

// Portfolio (Public routes)
router.get('/portfolio', portfolioController.getPortfolio);
router.get('/about', portfolioController.getAboutData);
router.get('/contact', portfolioController.getContactData);

// Skills (Public)
router.get('/skills', skillController.getAll);
router.get('/skills/:id', validateSkillId, skillValidationErrors, skillController.getById);

// Projects (Public)
router.get('/projects', projectController.getAll);
router.get('/projects/:id', validateProjectId, projectValidationErrors, projectController.getById);

// Experience (Public)
router.get('/experience', experienceController.getAll);
router.get('/experience/:id', validateExperienceId, experienceValidationErrors, experienceController.getById);

// Protected Routes (Admin)

// About & Contact (Admin)
router.put('/about', authMiddleware, validateUpdateAbout, aboutContactValidationErrors, portfolioController.updateAboutData);
router.put('/contact', authMiddleware, validateUpdateContact, aboutContactValidationErrors, portfolioController.updateContactData);

// Skills (Admin)
router.post('/skills', authMiddleware, validateCreateSkill, skillValidationErrors, skillController.create);
router.put('/skills/:id', authMiddleware, validateUpdateSkill, skillValidationErrors, skillController.update);
router.delete('/skills/:id', authMiddleware, validateSkillId, skillValidationErrors, skillController.remove);

// Projects (Admin)
router.post('/projects', authMiddleware, validateCreateProject, projectValidationErrors, projectController.create);
router.put('/projects/:id', authMiddleware, validateUpdateProject, projectValidationErrors, projectController.update);
router.delete('/projects/:id', authMiddleware, validateProjectId, projectValidationErrors, projectController.remove);

// Experience (Admin)
router.post('/experience', authMiddleware, validateCreateExperience, experienceValidationErrors, experienceController.create);
router.put('/experience/:id', authMiddleware, validateUpdateExperience, experienceValidationErrors, experienceController.update);
router.delete('/experience/:id', authMiddleware, validateExperienceId, experienceValidationErrors, experienceController.remove);

export default router;
