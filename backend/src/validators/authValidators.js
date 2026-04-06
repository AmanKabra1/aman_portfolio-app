import { body, validationResult } from 'express-validator';

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
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
