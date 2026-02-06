/**
 * Audio Engine for Microtonal Music Interface
 * Handles Web Audio API synthesis and frequency control
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.activeOscillators = new Map();
        this.waveform = 'sine';
        this.volume = 0.5;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            this.initialized = true;
            console.log('Audio engine initialized');
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }

    setVolume(value) {
        this.volume = value;
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }

    setWaveform(waveform) {
        this.waveform = waveform;
        // Update all active oscillators
        this.activeOscillators.forEach((data) => {
            if (data.oscillator) {
                data.oscillator.type = waveform;
            }
        });
    }

    playNote(noteId, frequency) {
        if (!this.initialized) {
            this.initialize();
        }

        // Resume audio context if suspended (required for iOS)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Stop existing note if playing
        this.stopNote(noteId);

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = this.waveform;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            // Smooth attack envelope
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.start();

            this.activeOscillators.set(noteId, {
                oscillator,
                gainNode,
                frequency
            });
        } catch (error) {
            console.error('Failed to play note:', error);
        }
    }

    stopNote(noteId) {
        const data = this.activeOscillators.get(noteId);
        if (data) {
            const { oscillator, gainNode } = data;
            
            // Smooth release envelope
            const currentTime = this.audioContext.currentTime;
            gainNode.gain.cancelScheduledValues(currentTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.1);

            oscillator.stop(currentTime + 0.1);
            this.activeOscillators.delete(noteId);
        }
    }

    stopAllNotes() {
        this.activeOscillators.forEach((_, noteId) => {
            this.stopNote(noteId);
        });
    }

    getActiveNotes() {
        return Array.from(this.activeOscillators.entries()).map(([id, data]) => ({
            id,
            frequency: data.frequency
        }));
    }
}

// Tuning systems
class TuningSystem {
    constructor(baseFrequency = 440) {
        this.baseFrequency = baseFrequency;
    }

    setBaseFrequency(freq) {
        this.baseFrequency = freq;
    }

    // Equal Division of the Octave (EDO)
    getEDOFrequency(steps, divisions = 12, baseNote = 0) {
        const ratio = Math.pow(2, (steps - baseNote) / divisions);
        return this.baseFrequency * ratio;
    }

    // 12-EDO (standard chromatic)
    get12EDO(semitones) {
        return this.getEDOFrequency(semitones, 12);
    }

    // 24-EDO (quarter tones)
    get24EDO(steps) {
        return this.getEDOFrequency(steps, 24);
    }

    // 31-EDO (meantone approximation)
    get31EDO(steps) {
        return this.getEDOFrequency(steps, 31);
    }

    // 53-EDO (Pythagorean approximation)
    get53EDO(steps) {
        return this.getEDOFrequency(steps, 53);
    }

    // Just Intonation ratios
    getJustIntonation(intervalIndex) {
        const justRatios = [
            1/1,      // Unison
            16/15,    // Minor second
            9/8,      // Major second
            6/5,      // Minor third
            5/4,      // Major third
            4/3,      // Perfect fourth
            45/32,    // Tritone
            3/2,      // Perfect fifth
            8/5,      // Minor sixth
            5/3,      // Major sixth
            9/5,      // Minor seventh
            15/8      // Major seventh
        ];
        
        const octave = Math.floor(intervalIndex / 12);
        const index = ((intervalIndex % 12) + 12) % 12;
        const ratio = justRatios[index];
        
        return this.baseFrequency * ratio * Math.pow(2, octave);
    }

    getFrequency(tuningType, step) {
        switch (tuningType) {
            case '12-edo':
                return this.get12EDO(step);
            case '24-edo':
                return this.get24EDO(step);
            case '31-edo':
                return this.get31EDO(step);
            case '53-edo':
                return this.get53EDO(step);
            case 'just':
                return this.getJustIntonation(step);
            default:
                return this.get12EDO(step);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioEngine, TuningSystem };
}
