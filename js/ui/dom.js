export const $ = id => document.getElementById(id);

export function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[ch]);
}

/** แสดง/ซ่อน element (displayClass เช่น 'flex' สำหรับ element ที่ต้องเป็น flex ตอนแสดง) */
export function setVisible(el, visible, displayClass) {
    el.classList.toggle('hidden', !visible);
    if (displayClass) el.classList.toggle(displayClass, visible);
}