import { $, escapeHTML, setVisible } from '../dom.js';
import { icon } from '../icons.js';
import { TOAST_DURATION_MS } from '../../config.js';

let timer;

export function showToast(message, { error = false } = {}) {
    const toast = $('toast');
    toast.innerHTML = `${icon(error ? 'exclamation-circle' : 'check-circle', 'w-5 h-5')}<span>${escapeHTML(message)}</span>`;
    toast.setAttribute('role', error ? 'alert' : 'status');
    toast.setAttribute('aria-live', error ? 'assertive' : 'polite');
    toast.classList.toggle('bg-rose-600', error);
    toast.classList.toggle('bg-emerald-500', !error);
    setVisible(toast, true, 'flex');

    clearTimeout(timer);
    timer = setTimeout(() => setVisible(toast, false, 'flex'), TOAST_DURATION_MS);
}
