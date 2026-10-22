import { $, setVisible } from '../dom.js';
import { icon } from '../icons.js';
import { statusDisplay } from '../statusDisplay.js';

const BADGE_BASE = 'inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold';

export function renderFlashcard(session) {
    const word = session.current();
    setVisible($('emptyFlashcardState'), !word);
    setVisible($('flashcardContainer'), Boolean(word));
    if (!word) return;

    const { index, total } = session.position();
    $('cardInner').classList.toggle('rotate-y-180', session.isFlipped());
    $('cardIndexText').textContent = `คำที่ ${index + 1} จาก ${total}`;
    $('cardFrontChapter').textContent = `บทที่ ${word.chapter} • ข้อ ${word.num}`;
    $('cardHanzi').textContent = word.hanzi;
    $('cardBackHanzi').textContent = word.hanzi;
    $('cardPinyin').textContent = word.pinyin;
    $('cardThai').textContent = word.thai;
    $('cardEng').textContent = word.eng;

    const status = statusDisplay(word.status);
    const badge = $('cardStatusBadge');
    badge.className = `${BADGE_BASE} ${status.className}`;
    badge.innerHTML = `${icon(status.icon, 'w-4 h-4')} ${status.label}`;
}

export function renderProgress({ memorized, unmemorized, fresh, percent }) {
    $('progressText').textContent = `จำได้ ${memorized} • จำไม่ได้ ${unmemorized} • ยังไม่ทบทวน ${fresh}`;
    $('progressPercent').textContent = `${percent}%`;
    $('progressBar').style.width = `${percent}%`;
    $('progressTrack').setAttribute('aria-valuenow', String(percent));
}