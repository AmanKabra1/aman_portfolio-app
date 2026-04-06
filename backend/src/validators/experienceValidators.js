import { body, param, validationResult } from 'express-validator';

export const validateCreateExperience = [
  body('company')
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2 })
    .withMessage('Company name must be at least 2 characters'),
  body('position')
    .notEmpty()
    .withMessage('Position is required')
    .isLength({ min: 2 })
    .withMessage('Position must be at least 2 characters'),
  body('duration')
    .notEmpty()
    .withMessage('Duration is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const validateUpdateExperience = [
  param('id')
    .isInt()
    .withMessage('Invalid experience ID'),
  body('company')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Company name must be at least 2 characters'),
  body('position')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Position must be at least 2 characters'),
  body('duration')
    .optional(),
  body('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const validateExperienceId = [
  param('id')
    .isInt()
    .withMessage('Invalid experience ID'),
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
