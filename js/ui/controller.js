import { $, setVisible } from './dom.js';
import { ALL_CHAPTERS, FILTER, STATUS } from '../domain/word.js';
import { MARK_ADVANCE_DELAY_MS } from '../config.js';
import { renderFlashcard, renderProgress } from './views/flashcardView.js';
import { renderVocabTable } from './views/listView.js';
import { renderChapterTabs } from './views/chapterTabs.js';
import {
    openWordModal,
    closeWordModal,
    isAnyModalOpen,
    isConfirmModalOpen,
    closeConfirmModal,
    openConfirmModal,
    confirmModal,
    readWordForm,
    populateChapterSelect,
} from './views/modalView.js';
import { showToast } from './views/toast.js';

const MODE = Object.freeze({ FLASHCARD: 'flashcard', LIST: 'list' });
const MODE_BTN_BASE = 'flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition';
const MODE_BTN_ACTIVE = `${MODE_BTN_BASE} bg-white text-indigo-600 shadow-sm`;
const MODE_BTN_IDLE = `${MODE_BTN_BASE} bg-indigo-700 text-white hover:bg-indigo-800`;

export function createController({ vocab, session, speech, copyText, settings }) {
    let mode = MODE.FLASHCARD;
    let speechRate = settings.loadSpeechRate();
    let markAdvanceTimer = null;

    const chapterOptions = () => vocab.getChapterIds().map(id => ({
        id,
        name: vocab.getChapterName(id),
        count: vocab.countInChapter(id),
    }));

    const defaultChapter = () => {
        const chapter = session.getChapter();
        return chapter === ALL_CHAPTERS ? vocab.getChapterIds()[0] : chapter;
    };

    // ---------- Render ----------
    function renderMode() {
        const isCard = mode === MODE.FLASHCARD;
        setVisible($('flashcardSection'), isCard);
        setVisible($('listSection'), !isCard);
        $('btnModeFlashcard').className = isCard ? MODE_BTN_ACTIVE : MODE_BTN_IDLE;
        $('btnModeList').className = isCard ? MODE_BTN_IDLE : MODE_BTN_ACTIVE;
        $('btnModeFlashcard').setAttribute('aria-pressed', String(isCard));
        $('btnModeList').setAttribute('aria-pressed', String(!isCard));
    }

    function renderTable() {
        renderVocabTable($('vocabTableBody'), session.visibleWords($('searchInput').value.trim()));
    }

    function render() {
        renderChapterTabs($('chapterTabs'), {
            chapters: chapterOptions(),
            current: session.getChapter(),
            total: vocab.getWords().length,
        });
        renderProgress(session.progress());
        renderFlashcard(session);
        if (mode === MODE.LIST) renderTable();
    }

    // ---------- Handlers ----------
    function cancelMarkAdvance() {
        if (markAdvanceTimer === null) return;
        clearTimeout(markAdvanceTimer);
        markAdvanceTimer = null;
    }

    function speak(text) {
        if (!text) return;
        if (!speech.speak(text, speechRate)) {
            showToast('เบราว์เซอร์ของคุณไม่รองรับการอ่านออกเสียง', { error: true });
        }
    }

    function markCurrent(status) {
        const word = session.current();
        if (!word || markAdvanceTimer !== null) return;
        vocab.setStatus(word.id, status);
        if (session.getFilter() === FILTER.ALL) {
            markAdvanceTimer = setTimeout(() => {
                markAdvanceTimer = null;
                session.next();
                renderFlashcard(session);
            }, MARK_ADVANCE_DELAY_MS);
        }
    }

    function saveWord() {
        const result = vocab.saveWord(readWordForm());
        if (!result.ok) {
            showToast(result.error, { error: true });
            return;
        }
        closeWordModal();
        showToast('บันทึกคำศัพท์แล้ว');
    }

    function createLesson() {
        const input = $('newLessonName');
        const id = vocab.createLesson(input.value);
        if (id === null) {
            showToast('กรุณาระบุชื่อบทเรียน', { error: true });
            input.focus();
            return;
        }
        populateChapterSelect(chapterOptions(), id);
        input.value = '';
        showToast('สร้างบทเรียนใหม่แล้ว');
    }

    async function copyVocab() {
        try {
            await copyText(vocab.exportAsText(session.getChapter()));
            showToast('คัดลอกรายการคำศัพท์แล้ว');
        } catch {
            showToast('คัดลอกไม่สำเร็จ กรุณาตรวจสอบสิทธิ์คลิปบอร์ด', { error: true });
        }
    }

    function restoreDefaults() {
        if (!vocab.canRestoreDefaults()) {
            showToast('ไม่พบไฟล์คำศัพท์เริ่มต้น', { error: true });
            return;
        }
        openConfirmModal({
            title: 'คืนค่าคำศัพท์เริ่มต้น',
            message: 'ข้อมูลที่แก้ไขเพิ่มเติมจะถูกล้าง ต้องการดำเนินการต่อหรือไม่?',
            confirmLabel: 'คืนค่าเริ่มต้น',
            onConfirm: () => {
                vocab.restoreDefaults();
                showToast('คืนค่าคำศัพท์เริ่มต้นแล้ว');
            },
        });
    }

    /** เรียกทุกครั้งที่คลังคำศัพท์เปลี่ยน */
    function onVocabChanged() {
        const chapter = session.getChapter();
        const chapterIds = vocab.getChapterIds();
        if (chapter !== ALL_CHAPTERS && !chapterIds.includes(chapter)) {
            session.setChapter(chapterIds[0] ?? ALL_CHAPTERS);
        } else {
            session.rebuild(session.current()?.id);
        }
        render();
    }

    // ---------- Action map (data-action="...") ----------
    const actions = {
        'switch-mode': el => { cancelMarkAdvance(); mode = el.dataset.mode; renderMode(); render(); },
        'select-chapter': el => {
            cancelMarkAdvance();
            const value = el.dataset.chapter;
            session.setChapter(value === ALL_CHAPTERS ? value : Number(value));
            render();
        },
        'reset-filter': () => {
            cancelMarkAdvance();
            $('statusFilter').value = FILTER.ALL;
            session.setFilter(FILTER.ALL);
            render();
        },
        'flip': () => { session.flip(); renderFlashcard(session); },
        'prev': () => { cancelMarkAdvance(); session.prev(); renderFlashcard(session); },
        'next': () => { cancelMarkAdvance(); session.next(); renderFlashcard(session); },
        'mark-memorized': () => markCurrent(STATUS.MEMORIZED),
        'mark-unmemorized': () => markCurrent(STATUS.UNMEMORIZED),
        'speak-current': () => speak(session.current()?.hanzi),
        'speak-word': el => speak(vocab.getWord(Number(el.dataset.id))?.hanzi),
        'shuffle': () => { session.shuffle(); renderFlashcard(session); },
        'reset-progress': () => openConfirmModal({
            title: 'รีเซ็ตสถานะการจำ',
            message: 'ต้องการรีเซ็ตสถานะ จำได้/จำไม่ได้ ของคำศัพท์ทั้งหมดใช่หรือไม่?',
            confirmLabel: 'รีเซ็ตสถานะ',
            onConfirm: () => {
                vocab.resetAllStatus();
                showToast('รีเซ็ตสถานะการจำแล้ว');
            },
        }),
        'toggle-status': el => vocab.toggleStatus(Number(el.dataset.id)),
        'add-word': () => openWordModal({ title: 'เพิ่มคำศัพท์ใหม่', chapters: chapterOptions(), chapter: defaultChapter() }),
        'edit-word': el => {
            const word = vocab.getWord(Number(el.dataset.id));
            if (word) openWordModal({ title: 'แก้ไขคำศัพท์', chapters: chapterOptions(), word });
        },
        'delete-word': el => {
            const word = vocab.getWord(Number(el.dataset.id));
            if (!word) {
                showToast('ไม่พบคำศัพท์ที่ต้องการลบ', { error: true });
                return;
            }
            openConfirmModal({
                title: 'ลบคำศัพท์',
                message: `ต้องการลบ “${word.hanzi}” ใช่หรือไม่?`,
                confirmLabel: 'ลบคำศัพท์',
                onConfirm: () => {
                    vocab.deleteWord(word.id);
                    showToast('ลบคำศัพท์แล้ว');
                },
            });
        },
        'create-lesson': createLesson,
        'close-modal': closeWordModal,
        'close-confirm-modal': closeConfirmModal,
        'confirm-modal': confirmModal,
        'copy-vocab': copyVocab,
        'restore-defaults': restoreDefaults,
    };

    function handleShortcut(event) {
        if (isAnyModalOpen()) {
            if (event.key === 'Escape') {
                if (isConfirmModalOpen()) closeConfirmModal();
                else closeWordModal();
            }
            return;
        }
        if (mode !== MODE.FLASHCARD || event.target.matches('input, select, textarea')) return;

        if (event.key === ' ') {
            event.preventDefault();
            actions.flip();
        } else if (event.key === 'ArrowLeft') {
            actions.prev();
        } else if (event.key === 'ArrowRight') {
            actions.next();
        }
    }

    function bindEvents() {
        // Event delegation: ฟังคลิกจุดเดียว แล้วส่งต่อตาม data-action
        document.addEventListener('click', event => {
            const el = event.target.closest('[data-action]');
            if (el) actions[el.dataset.action]?.(el, event);
        });

        $('statusFilter').addEventListener('change', e => { session.setFilter(e.target.value); render(); });
        $('searchInput').addEventListener('input', renderTable);
        $('speechRate').addEventListener('change', e => {
            speechRate = Number(e.target.value);
            settings.saveSpeechRate(speechRate);
        });

        $('editForm').addEventListener('submit', e => { e.preventDefault(); saveWord(); });
        $('newLessonName').addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); createLesson(); }
        });
        $('editModal').addEventListener('click', e => {
            if (e.target === e.currentTarget) closeWordModal(); // คลิกพื้นหลังเพื่อปิด
        });
        $('confirmModal').addEventListener('click', e => {
            if (e.target === e.currentTarget) closeConfirmModal();
        });

        document.addEventListener('keydown', handleShortcut);
        vocab.subscribe(onVocabChanged);
    }

    return {
        start() {
            $('speechRate').value = String(speechRate);
            bindEvents();
            renderMode();
            render();
        },
    };
}
