import { body, param, validationResult } from 'express-validator';

export const validateCreateSkill = [
  body('name')
    .notEmpty()
    .withMessage('Skill name is required')
    .isLength({ min: 2 })
    .withMessage('Skill name must be at least 2 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2 })
    .withMessage('Category must be at least 2 characters'),
  body('level')
    .isInt({ min: 0, max: 100 })
    .withMessage('Level must be between 0 and 100'),
];

export const validateUpdateSkill = [
  param('id')
    .isInt()
    .withMessage('Invalid skill ID'),
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Skill name must be at least 2 characters'),
  body('category')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Category must be at least 2 characters'),
  body('level')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Level must be between 0 and 100'),
];

export const validateSkillId = [
  param('id')
    .isInt()
    .withMessage('Invalid skill ID'),
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
