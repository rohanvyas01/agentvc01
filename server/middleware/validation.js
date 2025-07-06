const Joi = require('joi');

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  founder_name: Joi.string().min(1).required(),
  startup_name: Joi.string().min(1).required(),
  one_liner_pitch: Joi.string().min(10).required(),
  industry: Joi.string().min(1).required(),
  business_model: Joi.string().min(1).required(),
  funding_round: Joi.string().min(1).required(),
  raise_amount: Joi.string().min(1).required(),
  use_of_funds: Joi.string().min(10).required(),
  linkedin_profile: Joi.string().uri().optional().allow(''),
  website: Joi.string().uri().optional().allow('')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  founder_name: Joi.string().min(1).optional(),
  startup_name: Joi.string().min(1).optional(),
  one_liner_pitch: Joi.string().min(10).optional(),
  industry: Joi.string().min(1).optional(),
  business_model: Joi.string().min(1).optional(),
  funding_round: Joi.string().min(1).optional(),
  raise_amount: Joi.string().min(1).optional(),
  use_of_funds: Joi.string().min(10).optional(),
  linkedin_profile: Joi.string().uri().optional().allow(''),
  website: Joi.string().uri().optional().allow('')
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

module.exports = {
  validateRequest,
  signupSchema,
  loginSchema,
  updateProfileSchema
};