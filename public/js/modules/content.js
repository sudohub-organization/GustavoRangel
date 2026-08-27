import {
    asNonEmptyString,
    getValue,
    loadJson
} from './cms-utils.js';
import {
    normalizeHeroAction,
    normalizeSkillGroup,
    normalizeSocialLink,
    normalizeTimelineItem,
    renderHeroAction,
    renderSectionHeading,
    renderSkillGroup,
    renderSocialLink,
    renderTimelineItem,
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

export async function initContent() {
    try {
        const site = await loadJson('public/data/site.json');
        renderSiteContent(site);
    } catch (error) {
        console.error(error);
    }
}
