export const STORAGE_KEYS = Object.freeze({
    vocab: 'bizChineseVocab_v1',
    chapterNames: 'bizChineseChapterNames_v1',
    speechRate: 'bizChineseSpeechRate_v1',
});

// อ้างอิงจากตำแหน่งไฟล์นี้ จึงใช้ได้แม้ deploy ไว้ใน sub-path (เช่น GitHub Pages)
export const VOCAB_URL = new URL('../data/vocab.json', import.meta.url).href;

export const SPEECH = Object.freeze({ lang: 'zh-CN', defaultRate: 0.85 });
export const MARK_ADVANCE_DELAY_MS = 250;
export const TOAST_DURATION_MS = 3000;