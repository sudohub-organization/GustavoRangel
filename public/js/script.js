import { initNavigation } from './modules/navigation.js';
import { initContent } from './modules/content.js';
import { initProjectsSection } from './modules/projects.js';

window.lucide?.createIcons();

initNavigation();
initContent();
initProjectsSection();

const danceButton = document.getElementById('dance-btn');
let danceModulePromise = null;

if (danceButton) {
    danceButton.addEventListener('click', async (event) => {
        event.preventDefault();

        danceButton.setAttribute('aria-busy', 'true');

        try {
            danceModulePromise ??= import('./dance.js');
            const { initDance } = await danceModulePromise;
            initDance({ openImmediately: true });
        } catch (error) {
            console.error('Unable to load dance feature.', error);
        } finally {
            danceButton.removeAttribute('aria-busy');
        }
    }, { once: true });
}
