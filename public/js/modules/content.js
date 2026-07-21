import {
    asNonEmptyString,
    formatDate,
    getValue,
    loadJson,
    setText
} from './cms-utils.js';
import {
    normalizeHeroAction,
    normalizePost,
    normalizeSkillGroup,
    normalizeSocialLink,
    normalizeTimelineItem,
    renderBlogCard,
    renderBlogTags,
    renderHeroAction,
    renderMarkdown,
    renderSectionHeading,
    renderSkillGroup,
    renderSocialLink,
    renderTimelineItem,
    sortPostsNewestFirst
} from './cms-components.js';

function renderHeroActions(actions) {
    const container = document.querySelector('[data-content-list="hero.actions"]');
    if (!container || !Array.isArray(actions)) return;

    const normalized = actions.map(normalizeHeroAction).filter(Boolean);
    if (!normalized.length) return;

    container.innerHTML = normalized.map(renderHeroAction).join('');
}

function renderSocialLinks(links) {
    const container = document.querySelector('[data-content-list="hero.socialLinks"]');
    if (!container || !Array.isArray(links)) return;

    const normalized = links.map(normalizeSocialLink).filter(Boolean);
    if (!normalized.length) return;

    container.innerHTML = normalized.map(renderSocialLink).join('');
}

function renderSkills(items) {
    const container = document.querySelector('[data-content-list="skills.items"]');
    if (!container || !Array.isArray(items)) return;

    const normalized = items.map(normalizeSkillGroup).filter(Boolean);
    if (!normalized.length) return;

    container.innerHTML = normalized.map(renderSkillGroup).join('');
}

function renderExperience(items) {
    const container = document.querySelector('[data-content-list="experience.items"]');
    if (!container || !Array.isArray(items)) return;

    const normalized = items.map(normalizeTimelineItem).filter(Boolean);
    if (!normalized.length) return;

    container.innerHTML = normalized.map(renderTimelineItem).join('');
}

function renderSiteContent(site) {
    if (!site || typeof site !== 'object') return;

    document.querySelectorAll('[data-content]').forEach((element) => {
        const value = getValue(site, element.dataset.content);
        const text = asNonEmptyString(value);
        if (text) element.textContent = text;
    });

    document.querySelectorAll('[data-content-section]').forEach((element) => {
        const section = getValue(site, element.dataset.contentSection);
        if (section && typeof section === 'object') {
            element.innerHTML = renderSectionHeading(section);
        }
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

function getPublishedPosts(posts) {
    if (!Array.isArray(posts)) return [];

    return sortPostsNewestFirst(posts.map(normalizePost).filter(Boolean));
}

function setModalPost(post) {
    setText('#blog-modal-title', post.title);
    setText('#blog-modal-date', formatDate(post.date));
    setText('#blog-modal-excerpt', post.excerpt);

    const modalDate = document.getElementById('blog-modal-date');
    if (modalDate) modalDate.setAttribute('datetime', post.date);

    const body = document.getElementById('blog-modal-body');
    if (body) body.innerHTML = renderMarkdown(post.body);

    const image = document.getElementById('blog-modal-image');
    if (image) {
        image.classList.toggle('hidden', !post.coverImage);
        if (post.coverImage) {
            image.src = post.coverImage;
            image.alt = '';
        }
    }

    const tags = document.getElementById('blog-modal-tags');
    if (tags) {
        tags.innerHTML = renderBlogTags(post.tags, 'blog-modal__tag');
        tags.classList.toggle('hidden', post.tags.length === 0);
    }
}

function initBlogModal(posts) {
    const modal = document.getElementById('blog-modal');
    const closeButtons = Array.from(document.querySelectorAll('[data-blog-close]'));
    if (!modal || !posts.length) return;

    let activeOpenButton = null;

    const openModal = (post, button) => {
        activeOpenButton = button;
        setModalPost(post);
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('has-overlay');
        document.querySelector('[data-blog-close]')?.focus();
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('has-overlay');
        activeOpenButton?.focus();
    };

    document.querySelectorAll('[data-blog-open]').forEach((button) => {
        button.addEventListener('click', () => {
            const post = posts[Number(button.dataset.blogOpen)];
            if (post) openModal(post, button);
        });
    });

    closeButtons.forEach((button) => button.addEventListener('click', closeModal));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

function renderLatestPost(posts) {
    const post = posts[0];
    const card = document.getElementById('latest-blog-card');
    if (!card || !post) return;

    setText('#latest-blog-title', post.title);
    setText('#latest-blog-date', formatDate(post.date));
    setText('#latest-blog-excerpt', post.excerpt);
    document.getElementById('latest-blog-date')?.setAttribute('datetime', post.date);
    document.getElementById('latest-blog-open')?.setAttribute('data-blog-open', '0');
    card.classList.remove('hidden');
}

function renderBlogSection(posts) {
    const container = document.getElementById('blog-container');
    if (!container) return;

    if (!posts.length) {
        container.innerHTML = '<p class="empty-state">No published posts yet.</p>';
        return;
    }

    container.innerHTML = posts.map(renderBlogCard).join('');
}

function renderBlogError(error) {
    console.error(error);

    const container = document.getElementById('blog-container');
    if (container) {
        container.innerHTML = '<p class="empty-state empty-state--error">Blog posts could not be loaded.</p>';
    }
}

export async function initContent() {
    try {
        const site = await loadJson('public/data/site.json');
        renderSiteContent(site);
    } catch (error) {
        console.error(error);
    }

    try {
        const posts = getPublishedPosts(await loadJson('public/data/blog.json'));
        renderLatestPost(posts);
        renderBlogSection(posts);
        initBlogModal(posts);
        window.lucide?.createIcons();
    } catch (error) {
        renderBlogError(error);
    }
}
