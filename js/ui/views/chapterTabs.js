import { ALL_CHAPTERS } from '../../domain/word.js';
import { escapeHTML } from '../dom.js';

const TAB_BASE = 'shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition';
const TAB_ACTIVE = `${TAB_BASE} bg-indigo-600 text-white`;
const TAB_IDLE = `${TAB_BASE} bg-slate-100 text-slate-700 hover:bg-slate-200`;

export function renderChapterTabs(container, { chapters, current, total }) {
    const tab = (value, label) => {
        const active = value === current;
        return `<button type="button" data-action="select-chapter" data-chapter="${value}" aria-pressed="${active}" class="${active ? TAB_ACTIVE : TAB_IDLE}">${escapeHTML(label)}</button>`;
    };

    container.innerHTML = [
        '<span class="shrink-0 text-sm font-semibold text-slate-500 mr-1">เลือกบทเรียน:</span>',
        ...chapters.map(c => tab(c.id, `บทที่ ${c.id}: ${c.name} (${c.count})`)),
        tab(ALL_CHAPTERS, `รวมทั้งหมด (${total})`),
    ].join('');
}