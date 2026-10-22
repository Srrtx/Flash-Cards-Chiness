import { STORAGE_KEYS, SPEECH } from '../config.js';

export function createLocalStorageRepository(storage = window.localStorage) {
    const read = key => {
        try {
            return JSON.parse(storage.getItem(key));
        } catch {
            return null;
        }
    };

    const write = (key, value) => {
        try {
            storage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`บันทึก ${key} ไม่สำเร็จ`, error);
        }
    };

    return {
        loadWords() {
            const value = read(STORAGE_KEYS.vocab);
            return Array.isArray(value) ? value : null;
        },
        saveWords: words => write(STORAGE_KEYS.vocab, words),

        loadChapterNames() {
            const value = read(STORAGE_KEYS.chapterNames);
            return value && typeof value === 'object' ? value : null;
        },
        saveChapterNames: names => write(STORAGE_KEYS.chapterNames, names),

        loadSpeechRate() {
            const value = Number(read(STORAGE_KEYS.speechRate));
            return Number.isFinite(value) && value > 0 ? value : SPEECH.defaultRate;
        },
        saveSpeechRate: rate => write(STORAGE_KEYS.speechRate, rate),
    };
}