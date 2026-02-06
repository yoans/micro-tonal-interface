/**
 * Keyboard Layouts for Microtonal Interface
 * Defines various isomorphic and traditional keyboard layouts
 */

class KeyboardLayout {
    constructor(name, config) {
        this.name = name;
        this.config = config;
    }

    generateKeys(tuningSystem, tuningType, rows = 6, cols = 8) {
        return this.config.generator(tuningSystem, tuningType, rows, cols);
    }

    static getNoteNameFromStep(step, tuningType) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        if (tuningType === '12-edo' || tuningType === 'just') {
            const octave = Math.floor(step / 12) + 4;
            const note = noteNames[((step % 12) + 12) % 12];
            return `${note}${octave}`;
        } else if (tuningType === '24-edo') {
            const octave = Math.floor(step / 24) + 4;
            const noteIndex = step % 24;
            if (noteIndex % 2 === 0) {
                return `${noteNames[noteIndex / 2]}${octave}`;
            } else {
                const baseNote = noteNames[Math.floor(noteIndex / 2)];
                const nextNote = noteNames[Math.ceil(noteIndex / 2)];
                return `${baseNote}♯/♭${nextNote}${octave}`;
            }
        } else {
            const octave = Math.floor(step / parseInt(tuningType.split('-')[0])) + 4;
            return `St${step}O${octave}`;
        }
    }
}

// Chromatic layout (traditional piano-like)
const chromaticLayout = {
    name: 'Chromatic',
    generator: (tuningSystem, tuningType, rows, cols) => {
        const keys = [];
        const totalKeys = rows * cols;
        const startNote = -12; // Start one octave below A440
        
        for (let i = 0; i < totalKeys; i++) {
            const step = startNote + i;
            const frequency = tuningSystem.getFrequency(tuningType, step);
            const noteName = KeyboardLayout.getNoteNameFromStep(step, tuningType);
            const isAccidental = noteName.includes('#') || noteName.includes('♯');
            
            keys.push({
                id: `key-${i}`,
                step,
                frequency,
                noteName,
                isAccidental,
                row: Math.floor(i / cols),
                col: i % cols
            });
        }
        
        return keys;
    }
};

// Wicki-Hayden layout (isomorphic, used in concertinas)
const wickiHaydenLayout = {
    name: 'Wicki-Hayden',
    generator: (tuningSystem, tuningType, rows, cols) => {
        const keys = [];
        let keyId = 0;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Wicki-Hayden: each row is offset by 2 semitones
                // Each column is offset by 7 semitones (perfect fifth)
                const step = (col * 7) + (row * 2) - 12;
                const frequency = tuningSystem.getFrequency(tuningType, step);
                const noteName = KeyboardLayout.getNoteNameFromStep(step, tuningType);
                
                keys.push({
                    id: `key-${keyId++}`,
                    step,
                    frequency,
                    noteName,
                    isAccidental: false,
                    row,
                    col
                });
            }
        }
        
        return keys;
    }
};

// Harmonic Table layout (Tonnetz-based)
const harmonicLayout = {
    name: 'Harmonic Table',
    generator: (tuningSystem, tuningType, rows, cols) => {
        const keys = [];
        let keyId = 0;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Harmonic table: based on the Tonnetz
                // Horizontal: major thirds (4 semitones)
                // Vertical: minor thirds (3 semitones)
                const step = (col * 4) + (row * 3) - 12;
                const frequency = tuningSystem.getFrequency(tuningType, step);
                const noteName = KeyboardLayout.getNoteNameFromStep(step, tuningType);
                
                keys.push({
                    id: `key-${keyId++}`,
                    step,
                    frequency,
                    noteName,
                    isAccidental: false,
                    row,
                    col
                });
            }
        }
        
        return keys;
    }
};

// Janko layout (isomorphic piano replacement)
const jankoLayout = {
    name: 'Janko',
    generator: (tuningSystem, tuningType, rows, cols) => {
        const keys = [];
        let keyId = 0;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Janko: alternating rows offset by 1 semitone
                // Each key is 2 semitones apart horizontally
                const rowOffset = row % 2;
                const step = (col * 2) + rowOffset + (Math.floor(row / 2) * 12) - 12;
                const frequency = tuningSystem.getFrequency(tuningType, step);
                const noteName = KeyboardLayout.getNoteNameFromStep(step, tuningType);
                
                keys.push({
                    id: `key-${keyId++}`,
                    step,
                    frequency,
                    noteName,
                    isAccidental: noteName.includes('#') || noteName.includes('♯'),
                    row,
                    col
                });
            }
        }
        
        return keys;
    }
};

// Layout registry
const LAYOUTS = {
    'chromatic': chromaticLayout,
    'wicki-hayden': wickiHaydenLayout,
    'harmonic': harmonicLayout,
    'janko': jankoLayout
};

function getLayout(layoutName) {
    return LAYOUTS[layoutName] || LAYOUTS.chromatic;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KeyboardLayout, LAYOUTS, getLayout };
}
