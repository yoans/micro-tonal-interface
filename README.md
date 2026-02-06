# Microtonal Music Interface

A web-based microtonal music controller optimized for iPad and touch devices. Play microtonal music with multi-touch support, switchable keyboard layouts, and accurate frequency control.

## Features

- **Multi-Touch Support**: Play chords and multiple notes simultaneously
- **Multiple Keyboard Layouts**:
  - Chromatic (traditional piano-like)
  - Wicki-Hayden (isomorphic)
  - Harmonic Table (Tonnetz-based)
  - Janko (isomorphic piano replacement)
- **Tuning Systems**:
  - 12-EDO (standard Western tuning)
  - 24-EDO (quarter tones)
  - 31-EDO (meantone approximation)
  - 53-EDO (Pythagorean approximation)
  - Just Intonation
- **Accurate Frequency Control**: Adjustable base frequency (A440 standard)
- **Multiple Waveforms**: Sine, Triangle, Sawtooth, Square
- **iPad Optimized**: Responsive design with touch-optimized controls

## Getting Started

### Quick Start

Simply open `index.html` in a modern web browser (Chrome, Safari, Firefox, or Edge).

For the best experience on iPad:
1. Open in Safari
2. Tap the share button
3. Select "Add to Home Screen"
4. Launch the app from your home screen for full-screen experience

### Usage

1. **Select a Layout**: Choose from Chromatic, Wicki-Hayden, Harmonic Table, or Janko layouts
2. **Choose a Tuning System**: Select from various EDO systems or Just Intonation
3. **Adjust Base Frequency**: Fine-tune the reference pitch (default: A440 Hz)
4. **Select Waveform**: Choose the sound character (Sine, Triangle, Sawtooth, or Square)
5. **Adjust Volume**: Use the volume slider to control output level
6. **Play**: Touch/tap keys to play notes, use multiple fingers for chords

## Technical Details

### Browser Compatibility

- Chrome/Edge: Full support
- Safari (iOS/iPadOS): Full support
- Firefox: Full support
- Requires Web Audio API support

### Architecture

- **audio-engine.js**: Web Audio API synthesis and frequency calculation
- **keyboard-layouts.js**: Isomorphic keyboard layout definitions
- **app.js**: Main application logic and touch handling
- **styles.css**: Responsive styling optimized for touch devices
- **index.html**: Application structure

### Keyboard Layouts

#### Chromatic
Traditional piano-like layout with sequential semitones.

#### Wicki-Hayden
Isomorphic layout where:
- Each row is offset by 2 semitones
- Each column is offset by 7 semitones (perfect fifth)

#### Harmonic Table
Based on the Tonnetz (tone network):
- Horizontal: major thirds (4 semitones)
- Vertical: minor thirds (3 semitones)

#### Janko
Isomorphic piano replacement where:
- Alternating rows offset by 1 semitone
- Each key is 2 semitones apart horizontally

### Tuning Systems

- **12-EDO**: Standard Western equal temperament
- **24-EDO**: Divides the octave into 24 equal parts (quarter tones)
- **31-EDO**: 31 equal divisions, approximates meantone temperament
- **53-EDO**: 53 equal divisions, closely approximates Pythagorean tuning
- **Just Intonation**: Uses pure harmonic ratios

## Development

No build process required - this is a standalone HTML/CSS/JavaScript application.

## License

MIT License - Feel free to use and modify as needed.

## Credits

Inspired by instruments like the Lumatone and various isomorphic keyboard designs.