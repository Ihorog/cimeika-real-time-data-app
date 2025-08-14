const Joi = require('joi');

const schema = Joi.object({
  HUGGINGFACE_TOKEN: Joi.string().required(),
  WEATHER_API_KEY: Joi.string().required(),
  ASTROLOGY_API_KEY: Joi.string().required(),
  DEFAULT_CITY: Joi.string().default('London'),
  DEFAULT_SIGN: Joi.string().default('aries')
}).unknown();

const { value: env, error } = schema.validate(process.env, { abortEarly: false });

module.exports = {
  hfToken: env.HUGGINGFACE_TOKEN,
  weatherApiKey: env.WEATHER_API_KEY,
  astrologyApiKey: env.ASTROLOGY_API_KEY,
  defaultCity: env.DEFAULT_CITY,
  defaultSign: env.DEFAULT_SIGN,
  error
};
