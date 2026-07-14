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
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getValue(source, path) {
    return path.split('.').reduce((current, key) => {
        if (!current || typeof current !== 'object') return undefined;
        return current[key];
    }, source);
}

async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return response.json();
}

function setText(selector, value) {
    const element = document.querySelector(selector);
    const text = asNonEmptyString(value);
    if (element && text) element.textContent = text;
}

function normalizeHeroAction(action, index) {
    if (!action || typeof action !== 'object') return null;

    const label = asNonEmptyString(action.label);
    const href = asNonEmptyString(action.href);
    if (!label || !href) return null;

    return {
        label,
        href,
        style: action.style === 'secondary' ? 'secondary' : index === 0 ? 'primary' : 'secondary'
    };
}

function normalizeSocialLink(link) {
    if (!link || typeof link !== 'object') return null;

    const label = asNonEmptyString(link.label);
    const href = asNonEmptyString(link.href);
    if (!label || !href) return null;

    return {
        label,
        href,
        icon: asNonEmptyString(link.icon, 'link')
    };
}

function renderHeroActions(actions) {
    const container = document.querySelector('[data-content-list="hero.actions"]');
    if (!container || !Array.isArray(actions)) return;

    const normalized = actions.map(normalizeHeroAction).filter(Boolean);
    if (!normalized.length) return;

    container.innerHTML = normalized.map((action) => `
        <a
            href="${escapeHtml(action.href)}"
            class="hero-cta hero-cta--${escapeHtml(action.style)}"
        >
            ${escapeHtml(action.label)}
        </a>
    `).join('');
}

function renderSocialLinks(links) {
    const container = document.querySelector('[data-content-list="hero.socialLinks"]');
    if (!container || !Array.isArray(links)) return;

    const normalized = links.map(normalizeSocialLink).filter(Boolean);
    if (!normalized.length) return;

    container.innerHTML = normalized.map((link) => `
        <a
            href="${escapeHtml(link.href)}"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
            aria-label="${escapeHtml(link.label)}"
        >
            <i
                data-lucide="${escapeHtml(link.icon.toLowerCase())}"
                class="social-link__icon"
                aria-hidden="true"
            ></i>
        </a>
    `).join('');
}

function renderSkills(items) {
    const container = document.querySelector('[data-content-list="skills.items"]');
    if (!container || !Array.isArray(items)) return;

    const normalized = items
        .filter((item) => item && typeof item === 'object')
        .map((item, index) => ({
            id: `skill-cms-${index}`,
            title: asNonEmptyString(item.title),
            description: asNonEmptyString(item.description)
        }))
        .filter((item) => item.title && item.description);

    if (!normalized.length) return;

    container.innerHTML = normalized.map((item) => `
        <section class="skill-group" aria-labelledby="${escapeHtml(item.id)}">
            <h3 id="${escapeHtml(item.id)}">${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
        </section>
    `).join('');
}

function renderExperience(items) {
    const container = document.querySelector('[data-content-list="experience.items"]');
    if (!container || !Array.isArray(items)) return;

    const normalized = items
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
            title: asNonEmptyString(item.title),
            company: asNonEmptyString(item.company),
            date: asNonEmptyString(item.date),
            description: asNonEmptyString(item.description)
        }))
        .filter((item) => item.title && item.company && item.date && item.description);

    if (!normalized.length) return;

    container.innerHTML = normalized.map((item) => `
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
    `).join('');
}

function renderSiteContent(site) {
    if (!site || typeof site !== 'object') return;

    document.querySelectorAll('[data-content]').forEach((element) => {
        const value = getValue(site, element.dataset.content);
        const text = asNonEmptyString(value);
        if (text) element.textContent = text;
    });

    const heroImage = document.querySelector('[data-content-image="hero.image"]');
    const image = asNonEmptyString(getValue(site, 'hero.image'));
    const imageAlt = asNonEmptyString(getValue(site, 'hero.imageAlt'));
    if (heroImage && image) heroImage.setAttribute('src', image);
    if (heroImage && imageAlt) heroImage.setAttribute('alt', imageAlt);

    renderHeroActions(getValue(site, 'hero.actions'));
    renderSocialLinks(getValue(site, 'hero.socialLinks'));
    renderSkills(getValue(site, 'skills.items'));
    renderExperience(getValue(site, 'experience.items'));
    window.lucide?.createIcons();
}

function normalizePost(post) {
    if (!post || typeof post !== 'object') return null;

    const title = asNonEmptyString(post.title);
    const date = asNonEmptyString(post.date);
    const excerpt = asNonEmptyString(post.excerpt);
    const body = asNonEmptyString(post.body);
    if (!title || !date || !excerpt || !body || post.published !== true) return null;

    return {
        title,
        date,
        excerpt,
        body,
        coverImage: asNonEmptyString(post.coverImage),
        tags: asStringArray(post.tags)
    };
}

function formatPostDate(value) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(date);
}

function getLatestPost(posts) {
    if (!Array.isArray(posts)) return null;

    return posts
        .map(normalizePost)
        .filter(Boolean)
        .sort((postA, postB) => new Date(postB.date) - new Date(postA.date))[0] ?? null;
}

function renderPostBody(body) {
    return body
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br>')}</p>`)
        .join('');
}

function initBlogModal(post) {
    const modal = document.getElementById('blog-modal');
    const openButton = document.getElementById('latest-blog-open');
    const closeButtons = Array.from(document.querySelectorAll('[data-blog-close]'));
    if (!modal || !openButton) return;

    const openModal = () => {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('has-overlay');
        document.querySelector('[data-blog-close]')?.focus();
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('has-overlay');
        openButton.focus();
    };

    openButton.addEventListener('click', openModal);
    closeButtons.forEach((button) => button.addEventListener('click', closeModal));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    setText('#blog-modal-title', post.title);
    setText('#blog-modal-date', formatPostDate(post.date));
    setText('#blog-modal-excerpt', post.excerpt);

    const body = document.getElementById('blog-modal-body');
    if (body) body.innerHTML = renderPostBody(post.body);

    const image = document.getElementById('blog-modal-image');
    if (image && post.coverImage) {
        image.src = post.coverImage;
        image.alt = post.title;
        image.classList.remove('hidden');
    }

    const tags = document.getElementById('blog-modal-tags');
    if (tags) {
        tags.innerHTML = post.tags.map((tag) => `
            <span class="blog-modal__tag">${escapeHtml(tag)}</span>
        `).join('');
        tags.classList.toggle('hidden', post.tags.length === 0);
    }
}

function renderLatestPost(posts) {
    const post = getLatestPost(posts);
    const card = document.getElementById('latest-blog-card');
    if (!card || !post) return;

    setText('#latest-blog-title', post.title);
    setText('#latest-blog-date', formatPostDate(post.date));
    setText('#latest-blog-excerpt', post.excerpt);
    card.classList.remove('hidden');
    initBlogModal(post);
    window.lucide?.createIcons();
}

export async function initContent() {
    try {
        const site = await loadJson('public/data/site.json');
        renderSiteContent(site);
    } catch (error) {
        console.error(error);
    }

    try {
        const posts = await loadJson('public/data/blog.json');
        renderLatestPost(posts);
    } catch (error) {
        console.error(error);
    }
}
