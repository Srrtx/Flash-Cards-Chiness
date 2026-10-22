// การแสดงผลสถานะ ใช้ร่วมกันทั้งการ์ดและตาราง
const STATUS_DISPLAY = {
    memorized:   { icon: 'check-circle', className: 'bg-emerald-100 text-emerald-700', label: 'จำได้แล้ว',      shortLabel: 'จำได้' },
    unmemorized: { icon: 'x-circle',     className: 'bg-rose-100 text-rose-700',       label: 'ยังจำไม่ได้',     shortLabel: 'จำไม่ได้' },
    new:         { icon: 'minus-circle', className: 'bg-slate-200 text-slate-600',     label: 'ยังไม่ได้ประเมิน', shortLabel: 'กดเปลี่ยน' },
};

export const statusDisplay = status => STATUS_DISPLAY[status ?? 'new'] ?? STATUS_DISPLAY.new;