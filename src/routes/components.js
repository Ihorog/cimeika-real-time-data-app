const express = require('express');
const router = express.Router();

const components = new Map();
let componentCounter = 1;

function validNameType(name, type) {
  return (
    typeof name === 'string' &&
    name.trim() !== '' &&
    typeof type === 'string' &&
    type.trim() !== ''
  );
}

router.get('/', (req, res) => {
  res.json(Array.from(components.values()));
});

router.post('/', (req, res) => {
  const { name, type } = req.body;
  if (!validNameType(name, type)) {
    return res.status(400).json({ error: 'name and type are required' });
  }
  const id = 'component-' + componentCounter++;
  const component = {
    id,
    ...req.body,
    name: name.trim(),
    type: type.trim(),
  };
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
  const { name, type } = req.body;
  if (!validNameType(name, type)) {
    return res.status(400).json({ error: 'name and type are required' });
  }
  const component = {
    id: req.params.id,
    ...req.body,
    name: name.trim(),
    type: type.trim(),
  };
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
