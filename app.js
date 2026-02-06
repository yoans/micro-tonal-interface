/**
 * Main Application Logic
 * Handles UI interactions, touch events, and coordinates audio/layout modules
 */

// Global state
let audioEngine;
let tuningSystem;
let currentLayout = 'chromatic';
let currentTuning = '12-edo';
let activeTouches = new Map();

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize audio and tuning systems
    audioEngine = new AudioEngine();
    tuningSystem = new TuningSystem(440);
    
    // Set up event listeners
    setupControlListeners();
    
    // Generate initial keyboard
    generateKeyboard();
    
    // Initialize audio on first user interaction (required for iOS)
    document.addEventListener('touchstart', initAudioOnFirstTouch, { once: true });
    document.addEventListener('mousedown', initAudioOnFirstTouch, { once: true });
}

async function initAudioOnFirstTouch() {
    await audioEngine.initialize();
}

function setupControlListeners() {
    // Layout selector
    const layoutSelect = document.getElementById('layout-select');
    layoutSelect.addEventListener('change', (e) => {
        currentLayout = e.target.value;
        generateKeyboard();
    });
    
    // Tuning selector
    const tuningSelect = document.getElementById('tuning-select');
    tuningSelect.addEventListener('change', (e) => {
        currentTuning = e.target.value;
        generateKeyboard();
    });
    
    // Base frequency control
    const baseFreqInput = document.getElementById('base-freq');
    baseFreqInput.addEventListener('input', (e) => {
        const freq = parseFloat(e.target.value);
        tuningSystem.setBaseFrequency(freq);
        generateKeyboard();
    });
    
    // Waveform selector
    const waveformSelect = document.getElementById('waveform');
    waveformSelect.addEventListener('change', (e) => {
        audioEngine.setWaveform(e.target.value);
    });
    
    // Volume control
    const volumeSlider = document.getElementById('volume');
    volumeSlider.addEventListener('input', (e) => {
        const volume = parseInt(e.target.value) / 100;
        audioEngine.setVolume(volume);
    });
}

function generateKeyboard() {
    const container = document.getElementById('keyboard-container');
    container.innerHTML = '';
    
    // Remove all layout classes
    container.classList.remove('chromatic', 'wicki-hayden', 'harmonic', 'janko');
    
    // Add current layout class
    container.classList.add(currentLayout);
    
    // Get layout configuration
    const layout = getLayout(currentLayout);
    
    // Determine grid size based on layout
    let rows = 6;
    let cols = 8;
    
    if (currentLayout === 'chromatic') {
        rows = 4;
        cols = 12;
    }
    
    // Generate keys
    const keys = layout.generator(tuningSystem, currentTuning, rows, cols);
    
    // Create key elements
    keys.forEach(keyData => {
        const keyElement = createKeyElement(keyData);
        container.appendChild(keyElement);
    });
}

function createKeyElement(keyData) {
    const keyDiv = document.createElement('div');
    keyDiv.className = 'key';
    keyDiv.id = keyData.id;
    keyDiv.dataset.step = keyData.step;
    keyDiv.dataset.frequency = keyData.frequency;
    
    if (keyData.isAccidental) {
        keyDiv.classList.add('accidental');
    }
    
    // Note name
    const noteSpan = document.createElement('span');
    noteSpan.className = 'key-note';
    noteSpan.textContent = keyData.noteName;
    
    // Frequency display
    const freqSpan = document.createElement('span');
    freqSpan.className = 'key-freq';
    freqSpan.textContent = `${keyData.frequency.toFixed(2)} Hz`;
    
    keyDiv.appendChild(noteSpan);
    keyDiv.appendChild(freqSpan);
    
    // Add touch event listeners
    setupKeyListeners(keyDiv);
    
    return keyDiv;
}

function setupKeyListeners(keyElement) {
    // Touch events (for iPad/mobile)
    keyElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    keyElement.addEventListener('touchend', handleTouchEnd, { passive: false });
    keyElement.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    // Mouse events (for desktop testing)
    keyElement.addEventListener('mousedown', handleMouseDown);
    keyElement.addEventListener('mouseup', handleMouseUp);
    keyElement.addEventListener('mouseleave', handleMouseUp);
}

function handleTouchStart(e) {
    e.preventDefault();
    
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (target && target.classList.contains('key')) {
            playKey(target, touch.identifier);
        }
    }
    
    updateNoteDisplay();
}

function handleTouchEnd(e) {
    e.preventDefault();
    
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        stopKeyByTouch(touch.identifier);
    }
    
    updateNoteDisplay();
}

function handleMouseDown(e) {
    e.preventDefault();
    const key = e.currentTarget;
    playKey(key, 'mouse');
    updateNoteDisplay();
}

function handleMouseUp(e) {
    e.preventDefault();
    const key = e.currentTarget;
    stopKey(key);
    updateNoteDisplay();
}

function playKey(keyElement, touchId) {
    const frequency = parseFloat(keyElement.dataset.frequency);
    const keyId = keyElement.id;
    
    // Track the touch/mouse association
    activeTouches.set(touchId, keyId);
    
    // Play the note
    audioEngine.playNote(keyId, frequency);
    
    // Visual feedback
    keyElement.classList.add('active');
}

function stopKey(keyElement) {
    const keyId = keyElement.id;
    
    // Remove from active touches
    for (let [touchId, activeKeyId] of activeTouches) {
        if (activeKeyId === keyId) {
            activeTouches.delete(touchId);
        }
    }
    
    // Stop the note
    audioEngine.stopNote(keyId);
    
    // Remove visual feedback
    keyElement.classList.remove('active');
}

function stopKeyByTouch(touchId) {
    const keyId = activeTouches.get(touchId);
    if (keyId) {
        const keyElement = document.getElementById(keyId);
        if (keyElement) {
            stopKey(keyElement);
        }
    }
}

function updateNoteDisplay() {
    const noteDisplay = document.getElementById('note-display');
    const activeNotes = audioEngine.getActiveNotes();
    
    if (activeNotes.length === 0) {
        noteDisplay.textContent = '';
    } else {
        const noteText = activeNotes.map(note => {
            const keyElement = document.getElementById(note.id);
            if (keyElement) {
                const noteName = keyElement.querySelector('.key-note').textContent;
                return `${noteName} (${note.frequency.toFixed(2)} Hz)`;
            }
            return '';
        }).filter(text => text).join(', ');
        
        noteDisplay.textContent = `Playing: ${noteText}`;
    }
}

// Handle global touch move to support multi-touch chord playing
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    const currentTouchIds = new Set();
    const touches = e.touches;
    
    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        currentTouchIds.add(touch.identifier);
        
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const currentKeyId = activeTouches.get(touch.identifier);
        
        if (target && target.classList.contains('key')) {
            const targetKeyId = target.id;
            
            // If moved to a different key, stop old and play new
            if (currentKeyId !== targetKeyId) {
                if (currentKeyId) {
                    const oldKey = document.getElementById(currentKeyId);
                    if (oldKey) {
                        stopKey(oldKey);
                    }
                }
                playKey(target, touch.identifier);
            }
        } else if (currentKeyId) {
            // Touch moved off keyboard
            const oldKey = document.getElementById(currentKeyId);
            if (oldKey) {
                stopKey(oldKey);
            }
        }
    }
    
    updateNoteDisplay();
}, { passive: false });

// Prevent default touch behavior to avoid scrolling
document.addEventListener('touchstart', (e) => {
    if (e.target.closest('#keyboard-container')) {
        e.preventDefault();
    }
}, { passive: false });

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    audioEngine.stopAllNotes();
});
