import { VOCAB_URL } from '../config.js';
import { createWord, STATUS } from '../domain/word.js';

export async function fetchDefaultVocab(url = VOCAB_URL) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`โหลด vocab.json ไม่สำเร็จ (HTTP ${response.status})`);

    const data = await response.json();
    return {
        chapterNames: Object.fromEntries(data.chapters.map(c => [c.id, c.name])),
        words: data.words.map(w => createWord({ ...w, status: STATUS.NEW })),
    };
}