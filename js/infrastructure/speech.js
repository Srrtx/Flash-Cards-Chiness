import { SPEECH } from '../config.js';

export function createSpeechService(lang = SPEECH.lang) {
    const synth = window.speechSynthesis;

    return {
        isSupported: () => Boolean(synth),
        speak(text, rate) {
            if (!synth) return false;
            synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = rate;
            synth.speak(utterance);
            return true;
        },
    };
}