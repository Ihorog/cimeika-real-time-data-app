const Joi = require('joi');

const schema = Joi.object({
  HUGGINGFACE_TOKEN: Joi.string(),
  HF_SPACE_URL: Joi.string().uri().default('https://ihorog-cimeika-api.hf.space'),
  DEFAULT_CITY: Joi.string().default('London'),
  DEFAULT_SIGN: Joi.string().default('aries')
}).unknown();

const { value: env, error } = schema.validate(process.env, { abortEarly: false });

module.exports = {
  hfToken: env.HUGGINGFACE_TOKEN,
  hfSpaceUrl: env.HF_SPACE_URL,
  defaultCity: env.DEFAULT_CITY,
  defaultSign: env.DEFAULT_SIGN,
  error
};
