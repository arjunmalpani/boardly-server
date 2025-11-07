import Joi from 'joi';

export const registerSchema = Joi.object({
    username: Joi.string().pattern(/^[a-zA-Z0-9_.]+$/)
        .min(4).max(30).required()
        .messages({
            'string.base': 'Username should be a type of text',
            'string.empty': 'Username cannot be empty',
            'string.pattern.base': 'Username can only contain letters, numbers, underscores (_) and dots (.)',
            'string.min': 'Username should have a minimum length of 4',
            'string.max': 'Username should have a maximum length of 30',
            'any.required': 'Username is required'
        }),
    password: Joi.string().min(8).required()
        .messages({
            'string.min': 'Password must be at least 8 characters long', 'any.required': 'Password is required'
        }),
    displayName: Joi.string().min(1).required()
        .messages({
            'any.required': 'Full Name is required'
        }),
})
export const loginSchema = Joi.object({
    username: Joi.string().trim().required().messages({
        "string.empty": "Username is required",
    }),
    password: Joi.string().min(8).required().messages({
        "string.min": "Password must be at least 6 characters long",
        "string.empty": "Password is required",
    }),
});
