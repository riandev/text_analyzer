import Joi from "joi";

export const textSchema = Joi.object({
  user: Joi.string().required().messages({
    "string.empty": "Text is required",
    "any.required": "Text is required",
  }),
  text: Joi.string().required().messages({
    "string.empty": "Text is required",
    "any.required": "Text is required",
  }),
});
