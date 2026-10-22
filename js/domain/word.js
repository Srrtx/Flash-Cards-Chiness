export const STATUS = Object.freeze({
    NEW: null,
    MEMORIZED: 'memorized',
    UNMEMORIZED: 'unmemorized',
});

export const FILTER = Object.freeze({
    ALL: 'all',
    MEMORIZED: 'memorized',
    UNMEMORIZED: 'unmemorized',
});

export const ALL_CHAPTERS = 'all';

/** สร้าง Word entity แบบ immutable และทำข้อมูลให้สะอาด */
export function createWord({ id, chapter, num, hanzi, pinyin, eng = '', thai = '', status = STATUS.NEW }) {
    return Object.freeze({
        id,
        chapter: Number(chapter),
        num: Number(num),
        hanzi: String(hanzi ?? '').trim(),
        pinyin: String(pinyin ?? '').trim(),
        eng: String(eng ?? '').trim(),
        thai: String(thai ?? '').trim(),
        status: status ?? STATUS.NEW,
    });
}

/** คืนข้อความ error หรือ null ถ้าข้อมูลถูกต้อง */
export function validateWordInput({ hanzi, pinyin }) {
    if (!hanzi?.trim() || !pinyin?.trim()) return 'กรุณากรอกคำศัพท์ภาษาจีนและพินอิน';
    return null;
}

export function matchesFilter(word, filter) {
    if (filter === FILTER.MEMORIZED) return word.status === STATUS.MEMORIZED;
    if (filter === FILTER.UNMEMORIZED) return word.status !== STATUS.MEMORIZED;
    return true;
}

export function matchesQuery(word, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    return [word.hanzi, word.pinyin, word.eng, word.thai].some(v => v.toLowerCase().includes(q));
}

export function nextToggleStatus(status) {
    return status === STATUS.MEMORIZED ? STATUS.UNMEMORIZED : STATUS.MEMORIZED;
}