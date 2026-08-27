export function asNonEmptyString(value, fallback = '') {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function asStringArray(value) {
    if (!Array.isArray(value)) return [];

    return value
        .filter((item) => typeof item === 'string' && item.trim())
        .map((item) => item.trim());
}

export function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function getValue(source, path) {
    return path.split('.').reduce((current, key) => {
        if (!current || typeof current !== 'object') return undefined;
        return current[key];
    }, source);
}

export async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return response.json();
}

export function setText(selector, value) {
    const element = document.querySelector(selector);
    const text = asNonEmptyString(value);
    if (element && text) element.textContent = text;
}

export function formatDate(value) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(date);
}

export function safeUrl(value) {
    const url = asNonEmptyString(value);
    if (!url) return '';

    if (
        url.startsWith('/') ||
        url.startsWith('#') ||
        /^https?:\/\//i.test(url) ||
        /^mailto:/i.test(url)
    ) {
        return url;
    }

    return '';
}
