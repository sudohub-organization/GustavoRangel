function asNonEmptyString(value, fallback = '') {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function asStringArray(value) {
    if (!Array.isArray(value)) return [];

    return value
        .filter((item) => typeof item === 'string' && item.trim())
        .map((item) => item.trim());
}

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function normalizeLinks(value) {
    if (!value || typeof value !== 'object') return {};

    return {
        live: asNonEmptyString(value.live),
        repo: asNonEmptyString(value.repo),
        caseStudy: asNonEmptyString(value.caseStudy)
    };
}

function normalizeProject(project, index) {
    if (!project || typeof project !== 'object') return null;

    return {
        title: asNonEmptyString(project.title, `Project ${index + 1}`),
        summary: asNonEmptyString(project.summary, 'Project summary unavailable.'),
        role: asNonEmptyString(project.role, 'Developer'),
        stack: asStringArray(project.stack),
        year: asNonEmptyString(String(project.year ?? ''), 'Recent'),
        links: normalizeLinks(project.links),
        featured: Boolean(project.featured)
    };
}

function createProjectLinks(links) {
    const items = [
        { href: links.live, label: 'Live', primary: true },
        { href: links.repo, label: 'Repo' },
        { href: links.caseStudy, label: 'Case Study' }
    ].filter((item) => item.href);

    if (!items.length) {
        return '<span class="project-card__link project-card__link--muted">Available on request</span>';
    }

    return items.map((item) => `
        <a
            href="${escapeHtml(item.href)}"
            target="_blank"
            rel="noopener noreferrer"
            class="project-card__link${item.primary ? ' project-card__link--primary' : ''}"
        >
            ${item.label}
        </a>
    `).join('');
}

function createStackPills(stack) {
    const safeStack = stack.length ? stack : ['General'];

    return safeStack.map((tool) => `
        <span class="project-tool-pill">${escapeHtml(tool)}</span>
    `).join('');
}

function createProjectCard(project) {
    return `
        <article class="project-card">
            <div class="project-card__content">
                <div class="project-card__meta">
                    <p class="project-card__eyebrow">Featured project</p>
                    <span class="project-card__meta-pill">${escapeHtml(project.year)}</span>
                </div>
                <h3 class="project-card__title">${escapeHtml(project.title)}</h3>
                <p class="project-card__description">${escapeHtml(project.summary)}</p>
                <p class="project-card__role"><strong>Role:</strong> ${escapeHtml(project.role)}</p>
                <div class="project-tool-row">${createStackPills(project.stack)}</div>
                <div class="project-card__links">${createProjectLinks(project.links)}</div>
            </div>
        </article>
    `;
}

export async function initProjectsSection() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    try {
        const response = await fetch('public/data/projects.json');
        if (!response.ok) throw new Error('Failed to load projects');

        const payload = await response.json();
        const projects = Array.isArray(payload)
            ? payload.map(normalizeProject).filter(Boolean)
            : [];

        const featured = projects.filter((project) => project.featured);
        const visibleProjects = (featured.length ? featured : projects).slice(0, 5);

        if (visibleProjects.length) {
            container.innerHTML = visibleProjects.map(createProjectCard).join('');
            window.lucide?.createIcons();
        }
    } catch (error) {
        console.error(error);
    }
}
