import { body, validationResult } from 'express-validator';

const trimString = value => typeof value === 'string' ? value.trim() : value;

const socialUrlFields = [
  'github',
  'linkedin',
  'medium',
  'tableau',
  'leetcode',
  'instagram',
  'youtube',
  'portfolio',
];

const socialUrlValidators = socialUrlFields.map(field =>
  body(field)
    .customSanitizer(trimString)
    .optional({ values: 'falsy' })
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
    })
    .withMessage(`${field} must be a valid http or https URL`)
);

export const validateUpdateAbout = [
  body('bio')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Bio must be at least 10 characters'),
  body('description')
    .optional()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('yearsExperience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Years of experience must be a non-negative number'),
];

export const validateUpdateContact = [
  body('email')
    .customSanitizer(trimString)
    .optional({ values: 'falsy' })
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('phone')
    .customSanitizer(trimString)
    .optional({ values: 'falsy' })
    .isLength({ min: 10 })
    .withMessage('Phone number must be at least 10 characters'),
  body('location')
    .customSanitizer(trimString)
    .optional({ values: 'falsy' })
    .isLength({ min: 2 })
    .withMessage('Location must be at least 2 characters'),
  ...socialUrlValidators,
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
