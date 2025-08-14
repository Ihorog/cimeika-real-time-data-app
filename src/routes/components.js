const express = require('express');
const Joi = require('joi');

const router = express.Router();

const components = new Map();
let componentCounter = 1;

const attributeSchema = Joi.object({
  key: Joi.string().required(),
  value: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean()).required(),
}).unknown(false);

const componentSchema = Joi.object({
  name: Joi.string().trim().required(),
  type: Joi.string().trim().required(),
  attributes: Joi.array().items(attributeSchema).optional(),
}).unknown(false);

router.get('/', (req, res) => {
  res.json(Array.from(components.values()));
});

router.post('/', (req, res) => {
  const { value, error } = componentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: error.details.map((d) => d.message).join(', ') });
  }
  const id = 'component-' + componentCounter++;
  const component = { id, ...value };
  components.set(id, component);
  res.status(201).json(component);
});

router.get('/:id', (req, res) => {
  const component = components.get(req.params.id);
  if (!component) return res.status(404).json({ error: 'not found' });
  res.json(component);
});

router.put('/:id', (req, res) => {
  if (!components.has(req.params.id)) return res.status(404).json({ error: 'not found' });
  const { value, error } = componentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: error.details.map((d) => d.message).join(', ') });
  }
  const component = { id: req.params.id, ...value };
  components.set(req.params.id, component);
  res.json(component);
});

router.delete('/:id', (req, res) => {
  if (!components.has(req.params.id)) return res.status(404).end();
  components.delete(req.params.id);
  res.status(204).end();
});

router.post('/:id/link', (req, res) => {
  if (!components.has(req.params.id)) return res.status(404).json({ error: 'not found' });
  res.json({ status: 'linked' });
});

router.post('/:id/unlink', (req, res) => {
  if (!components.has(req.params.id)) return res.status(404).json({ error: 'not found' });
  res.json({ status: 'unlinked' });
});

router.get('/:id/attributes', (req, res) => {
  if (!components.has(req.params.id)) return res.status(404).json({ error: 'not found' });
  const component = components.get(req.params.id);
  res.json(component.attributes || []);
});

module.exports = router;
