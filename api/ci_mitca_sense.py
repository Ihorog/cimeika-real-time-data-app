import json
import random
from datetime import datetime

AXES = ['Казкар', 'ПоДія', 'Маля', 'Настрій']


def _signal_strength():
    return round(random.uniform(0.45, 0.98), 2)


def _semantic_nodes():
    return [
        {
            'axis': axis,
            'polarity': random.choice(['+', '-']),
            'weight': round(random.uniform(0.1, 1.0), 2)
        }
        for axis in AXES
    ]


def _annotations():
    return [
        {
            'type': 'resonance-window',
            'note': 'Semantic alignment recalculated.',
            'created_at': datetime.utcnow().isoformat() + 'Z'
        }
    ]


def build_sense_profile():
    strength = _signal_strength()
    return {
        'signal': {
            'strength': strength,
            'trend': random.choice(['rising', 'steady', 'falling'])
        },
        'nodes': _semantic_nodes(),
        'annotations': _annotations(),
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'seed': random.randint(1, 10_000),
        'resonance_hint': 1 / (1 + abs(strength - 0.8))
    }


def main():
    profile = build_sense_profile()
    print(json.dumps(profile, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
