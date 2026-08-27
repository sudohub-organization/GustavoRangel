import {
    asNonEmptyString,
    asStringArray,
    escapeHtml,
    safeUrl
} from './cms-utils.js';

const brandIcons = {
    github: '<svg class="social-link__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.49 11.49 0 0 1 12 6.1c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.23v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .3Z" /></svg>',
    linkedin: '<svg class="social-link__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.54V9H7.1v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z" /></svg>',
    youtube: '<svg class="social-link__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.13C19.49 3.56 12 3.56 12 3.56s-7.49 0-9.37.51A3.02 3.02 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 0 0 2.13 2.13c1.88.51 9.37.51 9.37.51s7.49 0 9.37-.51a3.02 3.02 0 0 0 2.13-2.13C24 15.92 24 12 24 12s0-3.92-.5-5.8ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" /></svg>'
};

const technologyIcons = {
    'android studio': 'smartphone',
    azure: 'cloud',
    blender: 'box',
    coolify: 'server',
    git: 'git-branch',
    github: 'github',
    javascript: 'braces',
    matplotlib: 'chart-line',
    mongodb: 'database',
    mysql: 'database',
    'node.js': 'hexagon',
    nlp: 'brain-circuit',
    python: 'file-code-2',
    'research reporting': 'book-open-check',
    'three.js': 'orbit'
};

function normalizeSocialVariant(value) {
    return ['linktree', 'coffee'].includes(value) ? value : '';
}

function renderSocialIcon(icon) {
    const normalizedIcon = icon.toLowerCase();
    if (brandIcons[normalizedIcon]) return brandIcons[normalizedIcon];

    return `
        <i
            data-lucide="${escapeHtml(normalizedIcon)}"
            class="social-link__icon"
            aria-hidden="true"
        ></i>
    `;
}

function normalizeTechnology(value) {
    const label = asNonEmptyString(value);
    if (!label) return null;

    const icon = technologyIcons[label.toLowerCase()];
    return { label, icon };
}

export function renderSectionHeading(section) {
    const kicker = asNonEmptyString(section?.kicker);
    const title = asNonEmptyString(section?.title);
    const intro = asNonEmptyString(section?.intro);

    return `
        ${kicker ? `<p class="section-kicker">${escapeHtml(kicker)}</p>` : ''}
        ${title ? `<h2 class="section-title">${escapeHtml(title)}</h2>` : ''}
        ${intro ? `<p class="section-intro">${escapeHtml(intro)}</p>` : ''}
    `;
}

export function normalizeHeroAction(action, index) {
    if (!action || typeof action !== 'object') return null;

    const label = asNonEmptyString(action.label);
    const href = safeUrl(action.href);
    if (!label || !href) return null;

    return {
        label,
        href,
        style: action.style === 'secondary' ? 'secondary' : index === 0 ? 'primary' : 'secondary'
    };
}

export function renderHeroAction(action) {
    return `
        <a
            href="${escapeHtml(action.href)}"
            class="hero-cta hero-cta--${escapeHtml(action.style)}"
        >
            ${escapeHtml(action.label)}
        </a>
    `;
}

export function normalizeSocialLink(link) {
    if (!link || typeof link !== 'object') return null;

    const label = asNonEmptyString(link.label);
    const href = safeUrl(link.href);
    if (!label || !href) return null;

    return {
        label,
        href,
        icon: asNonEmptyString(link.icon, 'link'),
        variant: asNonEmptyString(link.variant)
    };
}

export function renderSocialLink(link) {
    const variant = normalizeSocialVariant(link.variant);
    const variantClass = variant ? ` social-link--${variant}` : '';

    return `
        <a
            href="${escapeHtml(link.href)}"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link${variantClass}"
            aria-label="${escapeHtml(link.label)}"
        >
            ${renderSocialIcon(link.icon)}
        </a>
    `;
}

export function renderTechnologyChip(value) {
    const technology = normalizeTechnology(value);
    if (!technology) return '';

    const icon = technology.icon
        ? `<i data-lucide="${escapeHtml(technology.icon)}" aria-hidden="true"></i>`
        : `<span class="skill-tech__mark" aria-hidden="true">${escapeHtml(technology.label.slice(0, 4))}</span>`;

    return `
        <span class="skill-tech">
            ${icon}
            <span>${escapeHtml(technology.label)}</span>
        </span>
    `;
}

export function normalizeSkillGroup(item, index) {
    if (!item || typeof item !== 'object') return null;

    const title = asNonEmptyString(item.title);
    const description = asNonEmptyString(item.description);
    if (!title || !description) return null;

    return {
        id: `skill-cms-${index}`,
        title,
        description,
        technologies: asStringArray(item.technologies)
    };
}

export function renderSkillGroup(item) {
    return `
        <section class="skill-group" aria-labelledby="${escapeHtml(item.id)}">
            <h3 id="${escapeHtml(item.id)}">${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            ${item.technologies.length ? `
                <div class="skill-tech-list" aria-label="${escapeHtml(item.title)} technologies">
                    ${item.technologies.map(renderTechnologyChip).join('')}
                </div>
            ` : ''}
        </section>
    `;
}

function normalizeLinks(value) {
    if (!value || typeof value !== 'object') return {};

    return {
        live: safeUrl(value.live),
        repo: safeUrl(value.repo),
        caseStudy: safeUrl(value.caseStudy)
    };
}

export function normalizeProject(project, index) {
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

function renderProjectLinks(links) {
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
            ${escapeHtml(item.label)}
        </a>
    `).join('');
}

function renderStackPills(stack) {
    const safeStack = stack.length ? stack : ['General'];

    return safeStack.map((tool) => `
        <span class="project-tool-pill">${escapeHtml(tool)}</span>
    `).join('');
}

export function renderProjectCard(project) {
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
                <div class="project-tool-row">${renderStackPills(project.stack)}</div>
                <div class="project-card__links">${renderProjectLinks(project.links)}</div>
            </div>
        </article>
    `;
}

export function normalizeTimelineItem(item) {
    if (!item || typeof item !== 'object') return null;

    const title = asNonEmptyString(item.title);
    const company = asNonEmptyString(item.company);
    const date = asNonEmptyString(item.date);
    const description = asNonEmptyString(item.description);
    if (!title || !company || !date || !description) return null;

    return { title, company, date, description };
}

export function renderTimelineItem(item) {
    return `
        <article class="timeline-card">
            <div class="timeline-marker" aria-hidden="true"></div>
            <div class="timeline-panel">
                <div class="timeline-panel__header">
                    <div>
                        <h3 class="timeline-panel__title">${escapeHtml(item.title)}</h3>
                        <p class="timeline-company">${escapeHtml(item.company)}</p>
                    </div>
                    <span class="timeline-date">${escapeHtml(item.date)}</span>
                </div>
                <p class="timeline-description">${escapeHtml(item.description)}</p>
            </div>
        </article>
    `;
}
