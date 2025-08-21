const Joi = require('joi');

const schema = Joi.object({
  HUGGINGFACE_TOKEN: Joi.string(),
  DEFAULT_CITY: Joi.string().default('London'),
  DEFAULT_SIGN: Joi.string().default('aries')
}).unknown();

const { value: env, error } = schema.validate(process.env, { abortEarly: false });

module.exports = {
  hfToken: env.HUGGINGFACE_TOKEN,
  defaultCity: env.DEFAULT_CITY,
  defaultSign: env.DEFAULT_SIGN,
  error
};
