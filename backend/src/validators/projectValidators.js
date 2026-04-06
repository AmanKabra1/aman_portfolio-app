import { body, param, validationResult } from 'express-validator';

export const validateCreateProject = [
  body('title')
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 3 })
    .withMessage('Project title must be at least 3 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('image')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Invalid image URL'),
  body('liveLink')
    .notEmpty()
    .withMessage('Live link is required')
    .isURL()
    .withMessage('Invalid live link URL'),
  body('githubLink')
    .notEmpty()
    .withMessage('GitHub link is required')
    .isURL()
    .withMessage('Invalid GitHub link URL'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('technologies')
    .isArray()
    .withMessage('Technologies must be an array')
    .notEmpty()
    .withMessage('At least one technology is required'),
];

export const validateUpdateProject = [
  param('id')
    .isInt()
    .withMessage('Invalid project ID'),
  body('title')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Project title must be at least 3 characters'),
  body('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Invalid image URL'),
  body('liveLink')
    .optional()
    .isURL()
    .withMessage('Invalid live link URL'),
  body('githubLink')
    .optional()
    .isURL()
    .withMessage('Invalid GitHub link URL'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('technologies')
    .optional()
    .isArray()
    .withMessage('Technologies must be an array'),
];

export const validateProjectId = [
  param('id')
    .isInt()
    .withMessage('Invalid project ID'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};
