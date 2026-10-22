import { FILTER, matchesFilter, matchesQuery } from '../domain/word.js';
import { wordsInChapter, computeProgress, shuffleIds, applyOrder } from '../domain/deck.js';

/** สถานะของการทบทวน: บทที่เลือก, ตัวกรอง, ลำดับการ์ด, การ์ดปัจจุบัน */
export function createStudySession(vocab, { initialChapter }) {
    let chapter = initialChapter;
    let filter = FILTER.ALL;
    let order = null;      // ลำดับ id หลังสุ่ม (null = ลำดับปกติ)
    let deck = [];
    let index = 0;
    let flipped = false;

    const chapterWords = () => wordsInChapter(vocab.getWords(), chapter);

    function rebuild(preferredId) {
        deck = applyOrder(chapterWords().filter(w => matchesFilter(w, filter)), order);
        const preferred = deck.findIndex(w => w.id === preferredId);
        index = preferred >= 0 ? preferred : Math.min(index, Math.max(deck.length - 1, 0));
        flipped = false;
    }

    rebuild();

    return {
        getChapter: () => chapter,
        getFilter: () => filter,
        isFlipped: () => flipped,
        current: () => deck[index] ?? null,
        position: () => ({ index, total: deck.length }),
        progress: () => computeProgress(chapterWords()),
        visibleWords: (query = '') => chapterWords().filter(w => matchesFilter(w, filter) && matchesQuery(w, query)),

        rebuild,

        setChapter(next) {
            chapter = next;
            order = null;
            index = 0;
            rebuild();
        },

        setFilter(next) {
            filter = next;
            order = null;
            rebuild();
        },

        next() {
            if (!deck.length) return;
            index = (index + 1) % deck.length;
            flipped = false;
        },

        prev() {
            if (!deck.length) return;
            index = (index - 1 + deck.length) % deck.length;
            flipped = false;
        },

        flip() {
            flipped = !flipped;
        },

        shuffle() {
            order = shuffleIds(deck);
            index = 0;
            rebuild();
        },
    };
}