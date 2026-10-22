import { createWord, validateWordInput, nextToggleStatus, STATUS, ALL_CHAPTERS } from '../domain/word.js';
import { listChapterIds, nextChapterId, nextWordNum, wordsInChapter, formatAsText } from '../domain/deck.js';

/**
 * Use cases ของคลังคำศัพท์
 * - repository: { loadWords, saveWords, loadChapterNames, saveChapterNames }
 * - loadDefaults: () => Promise<{ words, chapterNames }>
 */
export function createVocabService({ repository, loadDefaults }) {
    let words = [];
    let chapterNames = {};
    let defaults = null;
    const listeners = new Set();

    const commit = () => {
        repository.saveWords(words);
        repository.saveChapterNames(chapterNames);
        listeners.forEach(listener => listener());
    };

    const updateWord = (id, changes) => {
        words = words.map(w => (w.id === id ? createWord({ ...w, ...changes }) : w));
    };

    return {
        async init() {
            try {
                defaults = await loadDefaults();
            } catch (error) {
                console.warn('โหลดคำศัพท์เริ่มต้นไม่สำเร็จ', error);
            }
            const storedWords = repository.loadWords();
            if (!storedWords && !defaults) {
                throw new Error('ไม่พบไฟล์ data/vocab.json และไม่มีข้อมูลที่บันทึกไว้ในเบราว์เซอร์');
            }
            words = storedWords ? storedWords.map(createWord) : [...defaults.words];
            chapterNames = repository.loadChapterNames() ?? { ...defaults?.chapterNames };
        },

        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },

        // ----- Queries -----
        getWords: () => words,
        getWord: id => words.find(w => w.id === id) ?? null,
        getChapterIds: () => listChapterIds(words, chapterNames),
        getChapterName: id => chapterNames[id] || `บทเรียน ${id}`,
        countInChapter: id => wordsInChapter(words, id).length,
        canRestoreDefaults: () => Boolean(defaults),

        exportAsText(chapter) {
            const label = chapter === ALL_CHAPTERS ? 'ทั้งหมด' : `บทที่ ${chapter}`;
            return formatAsText(wordsInChapter(words, chapter), `คำศัพท์ภาษาจีนธุรกิจ (${label})`);
        },

        // ----- Commands -----
        setStatus(id, status) {
            updateWord(id, { status });
            commit();
        },

        toggleStatus(id) {
            const word = words.find(w => w.id === id);
            if (!word) return;
            updateWord(id, { status: nextToggleStatus(word.status) });
            commit();
        },

        resetAllStatus() {
            words = words.map(w => createWord({ ...w, status: STATUS.NEW }));
            commit();
        },

        saveWord(input) {
            const error = validateWordInput(input);
            if (error) return { ok: false, error };

            const chapter = Number(input.chapter);
            const fields = { chapter, hanzi: input.hanzi, pinyin: input.pinyin, eng: input.eng, thai: input.thai };

            if (input.id) {
                updateWord(input.id, fields);
            } else {
                words = [...words, createWord({ ...fields, id: Date.now(), num: nextWordNum(words, chapter) })];
            }
            commit();
            return { ok: true };
        },

        deleteWord(id) {
            words = words.filter(w => w.id !== id);
            commit();
        },

        createLesson(name) {
            const trimmed = name.trim();
            if (!trimmed) return null;
            const id = nextChapterId(listChapterIds(words, chapterNames));
            chapterNames = { ...chapterNames, [id]: trimmed };
            commit();
            return id;
        },

        restoreDefaults() {
            if (!defaults) throw new Error('ไม่พบข้อมูลคำศัพท์เริ่มต้น');
            words = [...defaults.words];
            chapterNames = { ...defaults.chapterNames };
            commit();
        },
    };
}