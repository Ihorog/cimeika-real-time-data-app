const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const YAML = require('yamljs');
const { makeResponse } = require('./utils/responseHelper');

const router = express.Router();

const LEGEND_DIR = path.join(__dirname, '..', '..', '..', '..', 'data', 'legend');
const TREE_FILE = path.join(LEGEND_DIR, 'legend_tree.yaml');
const STREAM_FILE = path.join(LEGEND_DIR, 'legend_stream.json');
const MANIFEST_FILE = path.join(LEGEND_DIR, 'legend_manifest.md');
const SCENARIO_FILE = path.join(LEGEND_DIR, 'LegendCi_scenario.md');
const CI_LEGENDS_FILE = path.join(LEGEND_DIR, 'ci_legends.md');
const LOG_FILE = path.join(LEGEND_DIR, 'legend_log.txt');

const DEFAULT_TREE = {
  root: 'Origin_Ci',
  branches: [
    {
      id: 'silence',
      title: 'Silence',
      summary: 'The zero field before the first spark, full of potential.',
      sequence: 0,
      motifs: ['potential', '0/1 threshold'],
      leads_to: 'spark'
    },
    {
      id: 'spark',
      title: 'Spark',
      summary: 'Awakening tremor that shifts the field from stillness to motion.',
      sequence: 1,
      motifs: ['first tremor', 'permission to move'],
      leads_to: 'two_poles'
    },
    {
      id: 'two_poles',
      title: 'Two_Poles',
      summary: 'Opposite currents emerge and begin their balancing dance.',
      sequence: 2,
      motifs: ['duality', 'tension field'],
      leads_to: 'phenomenon'
    },
    {
      id: 'phenomenon',
      title: 'Phenomenon',
      summary: 'The meeting point of poles where Ci appears as a living process.',
      sequence: 3,
      motifs: ['contact', 'sparked resonance'],
      leads_to: 'legend_propagation'
    },
    {
      id: 'legend_propagation',
      title: 'LegendPropagation',
      summary: 'The legend spreads through modules as narrative, mood, and memory.',
      sequence: 4,
      motifs: ['integration', 'shared story'],
      leads_to: null
    }
  ]
};

const DEFAULT_STREAM = {
  name: 'Genesis_Flow',
  chapters: [
    {
      id: 'chapter_1',
      title: 'Silence and the First Spark',
      from: 'Silence',
      to: 'Spark',
      beats: ['Quiet field holds every possibility', 'A subtle tremor gives permission to move'],
      modules: ['Kazkar', 'Podija', 'Nastrij']
    },
    {
      id: 'chapter_2',
      title: 'Two Poles, One Axis',
      from: 'Spark',
      to: 'Two_Poles',
      beats: ['Warm and cool sides recognize each other', 'Tension becomes the playground for rhythm'],
      modules: ['Kazkar', 'Gallery', 'Ci']
    },
    {
      id: 'chapter_3',
      title: 'The Birth of Ci',
      from: 'Two_Poles',
      to: 'Phenomenon',
      beats: ['Opposites meet at a midpoint', 'A third state appears as Ci—contact in motion'],
      modules: ['Ci', 'Nastrij', 'Podija']
    },
    {
      id: 'chapter_4',
      title: 'Echoes in the Field',
      from: 'Phenomenon',
      to: 'LegendPropagation',
      beats: ['The new rhythm travels through memories', 'Modules capture mood, image, and timing'],
      modules: ['Gallery', 'Calendar', 'Kazkar']
    }
  ],
  sequence: ['Silence', 'Spark', 'Two_Poles', 'Phenomenon', 'LegendPropagation'],
  export: 'legend_stream.json'
};

async function readText(filePath, fallback = '') {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Unable to read ${filePath}:`, error.message);
    }
    return fallback;
  }
}

async function readYaml(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return YAML.parse(raw);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Unable to parse YAML ${filePath}:`, error.message);
    }
    return fallback;
  }
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Unable to parse JSON ${filePath}:`, error.message);
    }
    return fallback;
  }
}

function buildManifestPreview(manifestText, maxLines = 8) {
  if (!manifestText) return [];
  return manifestText
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line)
    .slice(0, maxLines);
}

function orderPhases(branches = []) {
  return [...branches].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
}

async function loadLegendContext() {
  const [tree, stream, manifestText, scenario, ciLegends, logText] = await Promise.all([
    readYaml(TREE_FILE, DEFAULT_TREE),
    readJson(STREAM_FILE, DEFAULT_STREAM),
    readText(MANIFEST_FILE),
    readText(SCENARIO_FILE),
    readText(CI_LEGENDS_FILE),
    readText(LOG_FILE)
  ]);

  const manifestPreview = buildManifestPreview(manifestText);
  const logEntries = logText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-10);

  return {
    tree,
    stream,
    manifestText,
    manifestPreview,
    scenario,
    ciLegends,
    logEntries
  };
}

router.get('/', async (req, res) => {
  try {
    const { tree, stream, manifestPreview, logEntries } = await loadLegendContext();

    res.json(
      makeResponse('legend', {
        message: 'Legend Ci activated: narrative-live mode online.',
        resources: {
          tree: '/api/v1/legend/tree',
          stream: '/api/v1/legend/stream',
          manifest: '/api/v1/legend/manifest',
          sources: '/api/v1/legend/sources',
          log: '/api/v1/legend/log'
        },
        core: {
          root: tree.root,
          phases: orderPhases(tree.branches || []).map(({ id, title, summary, motifs }) => ({
            id,
            title,
            summary,
            motifs
          }))
        },
        flowPreview: (stream.chapters || []).map(({ id, title, from, to }) => ({
          id,
          title,
          from,
          to
        })),
        manifestPreview,
        logTail: logEntries
      })
    );
  } catch (error) {
    res.status(500).json(
      makeResponse('legend', { error: 'Legend Ci context unavailable', details: error.message }, 'error')
    );
  }
});

router.get('/tree', async (req, res) => {
  const tree = await readYaml(TREE_FILE, DEFAULT_TREE);
  res.json(makeResponse('legend_tree', { tree }));
});

router.get('/stream', async (req, res) => {
  const stream = await readJson(STREAM_FILE, DEFAULT_STREAM);
  res.json(makeResponse('legend_stream', { stream }));
});

router.get('/manifest', async (req, res) => {
  const manifest = await readText(MANIFEST_FILE, '');
  res.json(makeResponse('legend_manifest', { manifest }));
});

router.get('/sources', async (req, res) => {
  const [scenario, ciLegends] = await Promise.all([
    readText(SCENARIO_FILE, ''),
    readText(CI_LEGENDS_FILE, '')
  ]);

  res.json(
    makeResponse('legend_sources', {
      files: ['legendaci.pdf', 'LegendCi_scenario.md', 'ci_legends.md'],
      scenario,
      ciLegends
    })
  );
});

router.get('/log', async (req, res) => {
  const logEntries = (await readText(LOG_FILE, ''))
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-50);

  res.json(makeResponse('legend_log', { entries: logEntries }));
});

module.exports = router;
module.exports.orderPhases = orderPhases;
module.exports.buildManifestPreview = buildManifestPreview;
module.exports.DEFAULT_TREE = DEFAULT_TREE;
module.exports.DEFAULT_STREAM = DEFAULT_STREAM;
