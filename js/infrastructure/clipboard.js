export function copyToClipboard(text) {
    if (!navigator.clipboard?.writeText) {
        return Promise.reject(new Error('Clipboard API ใช้ไม่ได้ (ต้องเป็น HTTPS หรือ localhost)'));
    }
    return navigator.clipboard.writeText(text);
}
