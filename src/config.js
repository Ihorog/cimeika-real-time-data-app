const Joi = require('joi');

const schema = Joi.object({
  HUGGINGFACE_TOKEN: Joi.string(),
  DEFAULT_CITY: Joi.string().default('London'),
  DEFAULT_SIGN: Joi.string().default('aries'),
  CACHE_TTL_MS: Joi.number().integer().min(0).default(5 * 60 * 1000)
}).unknown();

const { value: env, error } = schema.validate(process.env, { abortEarly: false });

module.exports = {
  hfToken: env.HUGGINGFACE_TOKEN,
  defaultCity: env.DEFAULT_CITY,
  defaultSign: env.DEFAULT_SIGN,
  cacheTtlMs: env.CACHE_TTL_MS,
  error
};
