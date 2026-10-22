import { ALL_CHAPTERS, STATUS } from './word.js';

export function wordsInChapter(words, chapter) {
    return chapter === ALL_CHAPTERS ? words : words.filter(w => w.chapter === chapter);
}

export function listChapterIds(words, chapterNames) {
    const ids = [...Object.keys(chapterNames).map(Number), ...words.map(w => w.chapter)];
    return [...new Set(ids)].sort((a, b) => a - b);
}

export function nextChapterId(chapterIds) {
    return chapterIds.length ? Math.max(...chapterIds) + 1 : 1;
}

export function nextWordNum(words, chapter) {
    const nums = words.filter(w => w.chapter === chapter).map(w => w.num);
    return nums.length ? Math.max(...nums) + 1 : 1;
}

export function computeProgress(words) {
    const count = status => words.filter(w => w.status === status).length;
    const total = words.length;
    const memorized = count(STATUS.MEMORIZED);
    return {
        total,
        memorized,
        unmemorized: count(STATUS.UNMEMORIZED),
        fresh: count(STATUS.NEW),
        percent: total ? Math.round((memorized / total) * 100) : 0,
    };
}

/** Fisher–Yates: คืนลำดับ id ที่สุ่มแล้ว */
export function shuffleIds(words, random = Math.random) {
    const ids = words.map(w => w.id);
    for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
}

/** เรียงคำตามลำดับ id ที่กำหนด (คำที่ไม่อยู่ในลำดับจะไปต่อท้าย) */
export function applyOrder(words, orderIds) {
    if (!orderIds) return words;
    const position = new Map(orderIds.map((id, i) => [id, i]));
    const last = orderIds.length;
    return [...words].sort((a, b) => (position.get(a.id) ?? last) - (position.get(b.id) ?? last));
}

export function formatAsText(words, title) {
    const lines = words.map(w => `${w.num}. ${w.hanzi} (${w.pinyin}) = ${w.thai} [${w.eng}]`);
    return `${title}\n\n${lines.join('\n')}\n`;
}