"""Render Dock Dash's original mission scores (NumPy, SciPy and FFmpeg).

The circular mixer wraps every note tail across the 32-bar boundary. These are
composed scores, not randomized beeps. No recordings or licensed samples are used.
"""
from pathlib import Path
import json
import re
import subprocess
import tempfile
import argparse
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
OUT = Path(__file__).resolve().parent
SCORES = [
    dict(slug='matchday-anthem', title='Matchday Anthem', bpm=112,
         roots=[50, 50, 45, 45, 47, 47, 43, 45], minor={47},
         melody=[[74, None, 78, 81, None, 78, 76, 74], [73, 76, None, 81, 78, 76, 73, None],
                 [74, 78, 81, 83, 81, 78, 76, 74], [71, None, 74, 78, 76, 73, 69, None]], voice='brass'),
    dict(slug='festival-lights', title='Festival Lights', bpm=104,
         roots=[45, 45, 49, 49, 42, 42, 50, 50], minor={42},
         melody=[[76, None, 73, 71, 69, None, 73, 76], [80, 76, None, 73, 71, 73, 76, None],
                 [78, None, 76, 73, 69, 73, None, 76], [78, 76, 74, None, 73, 71, 69, None]], voice='marimba'),
    dict(slug='rescue-tide', title='Rescue Tide', bpm=108,
         roots=[43, 43, 40, 40, 48, 48, 50, 50], minor={40},
         melody=[[74, None, 71, 69, 67, 69, 71, None], [71, 74, None, 76, 74, 71, 69, None],
                 [72, None, 76, 79, 76, 74, 72, None], [74, 78, None, 76, 74, 71, 69, None]], voice='pan'),
    dict(slug='orbital-express', title='Orbital Express', bpm=120,
         roots=[40, 40, 48, 48, 43, 43, 50, 50], minor={40},
         melody=[[76, 79, None, 83, 81, 79, 78, 74], [76, None, 79, 83, 86, 83, 79, None],
                 [79, 83, None, 86, 83, 81, 79, None], [78, None, 81, 86, 84, 81, 78, 74]], voice='chip'),
    dict(slug='gotham-after-dark',title='Gotham After Dark',bpm=110,
         roots=[45,45,41,41,48,48,43,40],minor={45,40},
         melody=[[69,None,72,76,None,74,72,69],[65,69,None,72,76,72,69,None],
                 [72,None,76,79,76,None,74,72],[67,71,None,74,71,68,64,None]],voice='chip',pulse=True),
    dict(slug='first-bell',title='First Bell',bpm=106,
         roots=[48,48,53,53,45,45,43,43],minor={45},
         melody=[[72,76,79,None,81,79,76,None],[77,None,81,84,81,79,77,76],
                 [76,81,None,84,81,79,76,72],[74,79,77,None,76,74,72,None]],voice='bell'),
    dict(slug='jurassic-trail',title='Jurassic Trail',bpm=114,
         roots=[50,50,43,43,47,47,45,45],minor={47},
         melody=[[74,None,78,81,78,74,76,None],[79,78,None,74,71,74,79,None],
                 [78,81,83,None,81,78,74,None],[76,None,73,69,73,76,78,None]],voice='marimba',tropical=True),
    dict(slug='sugar-rush',title='Sugar Rush',bpm=118,
         roots=[53,53,48,48,50,50,46,48],minor={50},
         melody=[[77,81,84,81,86,None,84,81],[79,None,76,72,76,79,84,None],
                 [81,86,89,None,86,84,81,77],[82,None,79,77,79,84,81,None]],voice='bell',pulse=True),
    dict(slug='moonleaf-lullaby',title='Moonleaf Lullaby',bpm=100,
         roots=[45,45,53,53,48,48,43,40],minor={45,40},
         melody=[[76,None,81,None,79,76,72,None],[77,None,81,84,None,81,79,None],
                 [79,76,None,72,76,None,79,83],[74,None,71,67,68,None,71,76]],voice='pan',gentle=True),
    dict(slug='aurora-rounds',title='Aurora Rounds',bpm=102,
         roots=[50,50,47,47,43,43,45,45],minor={47},
         melody=[[78,None,81,86,None,83,81,78],[78,83,None,86,83,81,78,None],
                 [79,None,83,86,83,79,78,74],[81,None,78,76,73,76,81,None]],voice='bell',gentle=True),
    dict(slug='roads-of-rome',title='Roads of Rome',bpm=114,
         roots=[50,50,46,46,53,53,48,45],minor={50,45},
         melody=[[74,None,77,81,79,77,74,None],[70,74,None,77,79,77,74,None],
                 [77,81,84,None,81,79,77,74],[76,None,73,69,73,76,77,None]],voice='brass'),
    dict(slug='lanterns-on-the-nile',title='Lanterns on the Nile',bpm=108,
         roots=[45,45,46,46,50,50,48,45],minor={45,50},
         melody=[[69,None,70,76,77,76,70,None],[70,74,None,77,76,74,70,None],
                 [74,None,77,81,77,76,74,None],[72,76,None,79,76,70,69,None]],voice='pan',gentle=True),
    dict(slug='northern-trade',title='Northern Trade',bpm=110,
         roots=[40,40,43,43,50,50,47,47],minor={40,47},
         melody=[[64,None,67,71,74,71,67,None],[67,71,None,74,76,74,71,67],
                 [74,None,78,81,78,76,74,None],[71,74,78,None,74,71,66,None]],voice='brass',gentle=True),
    dict(slug='caravan-at-dusk',title='Caravan at Dusk',bpm=116,
         roots=[50,50,43,43,48,48,45,45],minor={50,45},
         melody=[[74,77,None,81,84,81,77,74],[79,None,83,86,83,79,77,None],
                 [76,79,84,None,79,76,74,72],[76,None,81,84,81,76,73,None]],voice='plucked',tropical=True),
]

def tone(midi, seconds, voice):
    t = np.arange(round(seconds * SR), dtype=np.float64) / SR
    f = 440 * 2 ** ((midi - 69) / 12)
    phase = 2 * np.pi * f * t
    attack = np.minimum(1, t / .007)
    release = np.minimum(1, np.maximum(0, seconds - t) / .07)
    if voice == 'bass':
        wave = np.sin(phase) + .23 * np.sin(phase * 2) + .09 * np.sin(phase * 3)
        env = np.exp(-t * 2.2) * attack * release
    elif voice == 'pad':
        wave = np.sin(phase) + .2 * np.sin(phase * 2.003) + .12 * np.sin(phase * 3)
        env = np.minimum(1, t / .12) * np.minimum(1, (seconds - t) / .3) * .65
    elif voice == 'marimba':
        wave = np.sin(phase + 1.4 * np.sin(phase * 3) * np.exp(-t * 14)) + .25 * np.sin(phase * 2)
        env = np.exp(-t * 7) * attack * release
    elif voice == 'pan':
        wave = np.sin(phase + .8 * np.sin(phase * 2) * np.exp(-t * 9)) + .17 * np.sin(phase * 3)
        env = np.exp(-t * 4.5) * attack * release
    elif voice == 'bell':
        wave = np.sin(phase) + .3 * np.sin(phase * 2) * np.exp(-t * 7) + .13 * np.sin(phase * 3.99) * np.exp(-t * 10)
        env = np.exp(-t * 4) * attack * release
    elif voice == 'brass':
        wave = sum(np.sin(phase * h) / h for h in range(1, 7)) / 1.5
        env = np.exp(-t * 2.8) * np.minimum(1, t / .025) * release
    elif voice == 'plucked':
        wave = sum(np.sin(phase * h) / h ** 1.5 * np.exp(-t * h * 1.2) for h in range(1, 7))
        env = np.exp(-t * 5) * attack * release
    else:
        wave = sum(np.sin(phase * h) / h ** 1.65 for h in [1, 3, 5, 7])
        env = np.exp(-t * 3.8) * attack * release
    return (wave * env).astype(np.float32)

def drums(rng):
    t = np.arange(round(.45 * SR)) / SR
    kick = np.sin(2 * np.pi * (48 * t + 112 * (1 - np.exp(-t * 35)) / 35)) * np.exp(-t * 15)
    kick += rng.normal(0, .09, len(t)) * np.exp(-t * 220)
    kick *= np.minimum(1, t / .002)
    def noise(duration, decay, low, high):
        x = rng.normal(0, 1, round(duration * SR))
        x = sosfilt(butter(2, [low, high], btype='bandpass', fs=SR, output='sos'), x)
        t = np.arange(len(x)) / SR
        return x * np.exp(-t * decay) * np.minimum(1, t / .001)
    snare = noise(.28, 18, 900, 8000)
    t2 = np.arange(len(snare)) / SR
    snare += .25 * np.sin(2 * np.pi * 185 * t2) * np.exp(-t2 * 26)
    hat = noise(.13, 55, 6000, 16000)
    clap = noise(.22, 24, 1400, 7500)
    for delay in [.012, .024]:
        n = round(delay * SR)
        clap[n:] += .55 * clap[:-n]
    return {k: v.astype(np.float32) for k, v in dict(kick=kick, snare=snare, hat=hat, clap=clap).items()}

def render(score, index):
    beat = 60 / score['bpm']
    length = round(128 * beat * SR)
    mix = np.zeros((length, 2), dtype=np.float32)
    rng = np.random.default_rng(2810 + index)
    kit = drums(rng)
    def add(wave, beats, gain, pan=0):
        start = round(beats * beat * SR) % length
        wave = wave * gain
        stereo = wave[:, None] * np.array([np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)], dtype=np.float32)
        first = min(len(stereo), length - start)
        mix[start:start + first] += stereo[:first]
        if first < len(stereo):
            mix[:len(stereo) - first] += stereo[first:]
    for bar in range(32):
        root = score['roots'][bar % 8]
        chord = [0, 3 if root in score['minor'] else 4, 7]
        at = bar * 4
        for i, interval in enumerate(chord):
            add(tone(root + 12 + interval, 4.15 * beat, 'pad'), at, .055, (i - 1) * .45)
        for pos in ([0, 1.5, 2.75] if index == 2 or score.get('tropical') else [0,2] if score.get('gentle') else [0, 1, 2, 3]):
            add(kit['kick'], at + pos, .33)
        for pos in [1, 3]:
            add(kit['snare'], at + pos, .17, .05)
            if index in [0, 1]: add(kit['clap'], at + pos + .035, .1, -.1)
        for h in range(8):
            add(kit['hat'], at + h * .5, .036 if h % 2 == 0 else .054, .25 if h % 2 else -.25)
        bass_pattern = [(0, 0), (.75, 0), (1.5, 7), (2, 0), (2.75, 12), (3.5, 7)]
        if index == 3 or score.get('pulse'): bass_pattern = [(i * .5, 0 if i % 4 < 2 else 7) for i in range(8)]
        for pos, interval in bass_pattern:
            add(tone(root - 12 + interval, .43 * beat, 'bass'), at + pos, .2)
        motif = score['melody'][(bar // 2) % 4]
        # A contrasting bridge and a clear return make each 32-bar theme a song.
        if 16 <= bar < 24: motif = score['melody'][(bar // 2 + 2) % 4]
        for step, note in enumerate(motif):
            if note is not None:
                add(tone(note, .46 * beat, score['voice']), at + step * .5, .12, -.15)
                add(tone(note, .4 * beat, score['voice']), at + step * .5 + .25, .025, .4)
        if index == 3 or score.get('pulse'):
            for step in range(16):
                add(tone(root + 12 + chord[step % 3] + (12 if step % 4 == 3 else 0), .2 * beat, 'chip'), at + step * .25, .025, .45)
        else:
            for pos in [.5, 1.5, 2.5, 3.5]:
                for interval in chord:
                    add(tone(root + 24 + interval, .18 * beat, 'marimba'), at + pos, .025, .25)
    mix = np.tanh(mix * 1.1).astype('<f4') / 1.1
    with tempfile.TemporaryDirectory(prefix='dock-score-') as temp:
        pcm = Path(temp) / 'score.f32'
        pcm.write_bytes(mix.tobytes())
        input_args = ['-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', str(pcm)]
        normal = 'loudnorm=I=-18:TP=-2:LRA=9'
        first = subprocess.run(['ffmpeg', '-hide_banner', *input_args, '-af', normal + ':print_format=json', '-f', 'null', '-'], capture_output=True, text=True, check=True)
        levels = json.loads(re.findall(r'\{\s*"input_i".*?\}', first.stderr, re.S)[-1])
        measured = f":measured_I={levels['input_i']}:measured_TP={levels['input_tp']}:measured_LRA={levels['input_lra']}:measured_thresh={levels['input_thresh']}:offset={levels['target_offset']}:linear=true"
        target = OUT / (score['slug'] + '.mp3')
        subprocess.run(['ffmpeg', '-y', '-v', 'error', *input_args, '-af', normal + measured,
                        '-ar', str(SR), '-c:a', 'libmp3lame', '-b:a', '96k', '-write_xing', '1',
                        '-metadata', f"title={score['title']}", '-metadata', 'artist=Dock Dash Original Soundtrack',
                        '-metadata', f"comment=Original synthesized 32-bar score. {score['bpm']} BPM. Circular note-tail mix.", str(target)], check=True)
    return dict(file=target.name, bpm=score['bpm'], duration_seconds=round(length / SR, 3), bytes=target.stat().st_size)

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--new-only',action='store_true');parser.add_argument('--history-only',action='store_true');args=parser.parse_args()
    metadata=OUT / 'mission-music.json'
    first=10 if args.history_only else 4 if args.new_only else 0
    report=json.loads(metadata.read_text())[:first] if first else []
    for index, score in enumerate(SCORES):
        if index<first: continue
        result = render(score, index)
        report.append(result)
        print(json.dumps(result), flush=True)
    (OUT / 'mission-music.json').write_text(json.dumps(report, indent=2) + '\n')
