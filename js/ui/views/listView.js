import { escapeHTML } from '../dom.js';
import { icon } from '../icons.js';
import { statusDisplay } from '../statusDisplay.js';

function rowTemplate(word) {
    const status = statusDisplay(word.status);
    return `
    <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 text-slate-400 font-medium">${word.chapter}.${word.num}</td>
        <td class="py-3 px-4">
            <div class="flex items-center gap-2">
                <span class="chinese-text text-lg font-bold text-slate-800">${escapeHTML(word.hanzi)}</span>
                <button type="button" data-action="speak-word" data-id="${word.id}" aria-label="ฟังเสียง" title="ฟังเสียง" class="p-1 rounded-md text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition">
                    ${icon('speaker-wave', 'w-4 h-4')}
                </button>
            </div>
        </td>
        <td class="py-3 px-4 text-indigo-600 font-medium">${escapeHTML(word.pinyin)}</td>
        <td class="py-3 px-4">
            <div class="font-semibold text-slate-800">${escapeHTML(word.eng)}</div>
            <div class="text-xs text-slate-500">${escapeHTML(word.thai)}</div>
        </td>
        <td class="py-3 px-4 text-center">
            <button type="button" data-action="toggle-status" data-id="${word.id}" title="กดเพื่อสลับสถานะ" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${status.className}">
                ${icon(status.icon, 'w-4 h-4')} ${status.shortLabel}
            </button>
        </td>
        <td class="py-3 px-4 text-right whitespace-nowrap">
            <div class="inline-flex gap-1">
                <button type="button" data-action="edit-word" data-id="${word.id}" aria-label="แก้ไข" title="แก้ไข" class="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md transition">
                    ${icon('edit-word', 'w-4 h-4')}
                </button>
                <button type="button" data-action="delete-word" data-id="${word.id}" aria-label="ลบ" title="ลบ" class="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md transition">
                    ${icon('trash', 'w-4 h-4')}
                </button>
            </div>
        </td>
    </tr>`;
}

export function renderVocabTable(tbody, words) {
    tbody.innerHTML = words.length
        ? words.map(rowTemplate).join('')
        : '<tr><td colspan="6" class="py-10 text-center text-slate-400">ไม่พบคำศัพท์ที่ตรงกับเงื่อนไข</td></tr>';
}