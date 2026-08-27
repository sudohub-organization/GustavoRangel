import { loadJson } from './cms-utils.js';
import { normalizeProject, renderProjectCard } from './cms-components.js';

export async function initProjectsSection() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    try {
        const payload = await loadJson('public/data/projects.json');
        const projects = Array.isArray(payload)
            ? payload.map(normalizeProject).filter(Boolean)
            : [];

        const featured = projects.filter((project) => project.featured);
        const visibleProjects = (featured.length ? featured : projects).slice(0, 5);

        if (visibleProjects.length) {
            container.innerHTML = visibleProjects.map(renderProjectCard).join('');
            window.lucide?.createIcons();
        }
    } catch (error) {
        console.error(error);
    }
}
