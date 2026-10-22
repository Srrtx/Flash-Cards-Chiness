import { $, escapeHTML, setVisible } from '../dom.js';

let confirmAction = null;

export function populateChapterSelect(chapters, selected) {
    const select = $('editChapter');
    select.innerHTML = chapters
        .map(c => `<option value="${c.id}">บทที่ ${c.id}: ${escapeHTML(c.name)}</option>`)
        .join('');
    if (selected != null) select.value = String(selected);
}

export function openWordModal({ title, chapters, word = null, chapter }) {
    $('modalTitle').textContent = title;
    $('editId').value = word?.id ?? '';
    populateChapterSelect(chapters, word?.chapter ?? chapter);
    $('editHanzi').value = word?.hanzi ?? '';
    $('editPinyin').value = word?.pinyin ?? '';
    $('editEng').value = word?.eng ?? '';
    $('editThai').value = word?.thai ?? '';
    $('newLessonName').value = '';
    setVisible($('editModal'), true, 'flex');
    $('editHanzi').focus();
}

export function closeWordModal() {
    setVisible($('editModal'), false, 'flex');
}

export function isModalOpen() {
    return !$('editModal').classList.contains('hidden');
}

export function openConfirmModal({ title, message, confirmLabel = 'ยืนยัน', onConfirm }) {
    confirmAction = onConfirm;
    $('confirmTitle').textContent = title;
    $('confirmMessage').textContent = message;
    $('confirmActionLabel').textContent = confirmLabel;
    setVisible($('confirmModal'), true, 'flex');
    $('confirmActionButton').focus();
}

export function closeConfirmModal() {
    confirmAction = null;
    setVisible($('confirmModal'), false, 'flex');
}

export function confirmModal() {
    const action = confirmAction;
    closeConfirmModal();
    action?.();
}

export function isConfirmModalOpen() {
    return !$('confirmModal').classList.contains('hidden');
}

export function isAnyModalOpen() {
    return isModalOpen() || isConfirmModalOpen();
}

export function readWordForm() {
    const id = $('editId').value;
    return {
        id: id ? Number(id) : null,
        chapter: Number($('editChapter').value),
        hanzi: $('editHanzi').value,
        pinyin: $('editPinyin').value,
        eng: $('editEng').value,
        thai: $('editThai').value,
    };
}
