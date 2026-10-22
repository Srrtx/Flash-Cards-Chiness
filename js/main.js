import { createLocalStorageRepository } from './infrastructure/storage.js';
import { fetchDefaultVocab } from './infrastructure/vocabSource.js';
import { createSpeechService } from './infrastructure/speech.js';
import { copyToClipboard } from './infrastructure/clipboard.js';
import { createVocabService } from './application/vocabService.js';
import { createStudySession } from './application/studySession.js';
import { createController } from './ui/controller.js';
import { hydrateIcons, icon } from './ui/icons.js';
import { $, escapeHTML } from './ui/dom.js';
import { ALL_CHAPTERS } from './domain/word.js';

function showApp() {
    $('appStatus').classList.add('hidden');
    $('appContent').classList.remove('hidden');
}

function showFatalError(error) {
    const box = $('appStatus');
    box.className = 'bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl text-sm space-y-2';
    box.innerHTML = `
        <p class="font-semibold flex items-center gap-2">${icon('exclamation-circle', 'w-5 h-5')} โหลดคลังคำศัพท์ไม่สำเร็จ</p>
        <p>${escapeHTML(error.message)}</p>
        <p>ถ้าเปิดไฟล์โดยดับเบิลคลิก (file://) เบราว์เซอร์จะไม่ให้อ่าน <code>data/vocab.json</code> ให้เปิดผ่าน local server แทน เช่น <code>python -m http.server</code></p>`;
}

async function bootstrap() {
    hydrateIcons();

    const repository = createLocalStorageRepository();
    const vocab = createVocabService({ repository, loadDefaults: fetchDefaultVocab });

    try {
        await vocab.init();
    } catch (error) {
        console.error(error);
        showFatalError(error);
        return;
    }

    const session = createStudySession(vocab, {
        initialChapter: vocab.getChapterIds()[0] ?? ALL_CHAPTERS,
    });

    createController({
        vocab,
        session,
        speech: createSpeechService(),
        copyText: copyToClipboard,
        settings: repository,
    }).start();

    showApp();
}

bootstrap();