export function initNavigation() {
    const links = Array.from(document.querySelectorAll('[data-section-link]'));
    const sections = links
        .map((link) => document.getElementById(link.dataset.sectionLink))
        .filter(Boolean);

    if (!links.length || !sections.length) return;

    const setActiveLink = (id) => {
        links.forEach((link) => {
            const isActive = link.dataset.sectionLink === id;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const getHeaderOffset = () => {
        const header = document.getElementById('page-header');
        return (header?.offsetHeight ?? 0) + 24;
    };

    const getCurrentSectionId = () => {
        const marker = window.scrollY + getHeaderOffset();
        const currentSection = sections.reduce((current, section) => {
            return section.offsetTop <= marker ? section : current;
        }, sections[0]);

        return currentSection.id;
    };

    const updateActiveLink = () => {
        setActiveLink(getCurrentSectionId());
    };

    let frameId = null;
    const requestActiveUpdate = () => {
        if (frameId) return;

        frameId = window.requestAnimationFrame(() => {
            frameId = null;
            updateActiveLink();
        });
    };

    if (window.location.hash) {
        setActiveLink(window.location.hash.slice(1));
    } else {
        updateActiveLink();
    }

    window.addEventListener('scroll', requestActiveUpdate, { passive: true });
    window.addEventListener('resize', requestActiveUpdate);
    window.addEventListener('hashchange', () => {
        if (window.location.hash) {
            setActiveLink(window.location.hash.slice(1));
        } else {
            updateActiveLink();
        }
    });
}
