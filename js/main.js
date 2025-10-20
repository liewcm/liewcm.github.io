import { loadConfig, getMetaElements } from './config.js';
import { initGooeyNav } from './gooeyNav.js';
import { initInfiniteMenu } from './infiniteMenu.js';
import { initBlurText } from './blurText.js';
import { initScrollFloat } from './scrollFloat.js';
import { initLightRays } from './lightRays.js';
import { initFlowingMenu } from './flowingMenu.js';

const SCROLLBAR = {
  revealEdgePx: 40,
  widthPx: 6,
  minThumbPx: 28,
  idleOpacity: 0.25
};

const state = {
  config: null,
  reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  controllers: {
    nav: null,
    marquee: null,
    scrollFloat: null,
    lightRays: null,
    flowingMenu: null
  },
  observers: {
    sections: null
  }
};

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

init();

async function init() {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('has-js');
  document.documentElement.dataset.reduceMotion = state.reduceMotion ? 'true' : 'false';

  try {
    state.config = await loadConfig();
  } catch (error) {
    console.error('[main] Unable to load config.json', error);
  }

  applySiteMeta(state.config);
  populateHero(state.config);
  populateAbout(state.config);
  populateProjects(state.config);
  setupContact(state.config);

  setupGooeyNav();
  setupSectionsObserver();
  setupScrollbar();

  initBlurEffects();
  activateEnhancements();

  motionQuery.addEventListener('change', handleMotionPreferenceChange);
}

function handleMotionPreferenceChange(event) {
  state.reduceMotion = event.matches;
  document.documentElement.dataset.reduceMotion = state.reduceMotion ? 'true' : 'false';
  activateEnhancements();
}

function applySiteMeta(config) {
  const site = config && config.site ? config.site : null;
  const meta = getMetaElements();
  if (meta.title && site && site.title) {
    meta.title.textContent = site.title;
  }
  if (meta.description && site && site.description) {
    meta.description.setAttribute('content', site.description);
  }
}

function populateHero(config) {
  const hero = config && config.hero ? config.hero : null;
  const nameEl = document.querySelector('[data-hero-name]');
  const headlineEl = document.querySelector('[data-hero-headline]');
  const imageEl = document.querySelector('.hero__portrait img');

  if (hero && hero.name && nameEl) {
    nameEl.textContent = hero.name;
  }
  if (hero && hero.headline && headlineEl) {
    headlineEl.textContent = hero.headline;
  }
  if (hero && hero.image && imageEl) {
    imageEl.src = hero.image;
    imageEl.alt = 'Portrait of ' + (hero.name || 'Liew Cheah Ming');
  }
}

function populateAbout(config) {
  const about = config && config.about ? config.about : null;
  const target = document.querySelector('[data-about-content]');
  if (!target) return;

  target.innerHTML = '';

  const summary = about && Array.isArray(about.summary) && about.summary.length
    ? about.summary
    : [
        'Exploring how machine learning and intuitive interfaces intersect to solve everyday challenges.',
        'I am constantly iterating on ideas that make intelligent systems more approachable and useful.'
      ];

  summary.forEach(function (line) {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    target.appendChild(paragraph);
  });
}

function populateProjects(config) {
  const projects = config && Array.isArray(config.projects) ? config.projects : [];
  const template = document.getElementById('project-card-template');
  const grid = document.querySelector('[data-project-grid]');
  if (!template || !grid) return;

  grid.innerHTML = '';

  projects.forEach(function (project) {
    const instance = template.content.cloneNode(true);
    const article = instance.querySelector('.project-card');
    const media = instance.querySelector('.project-card__media img');
    const date = instance.querySelector('.project-card__date');
    const tags = instance.querySelector('.project-card__tags');
    const title = instance.querySelector('.project-card__title');
    const desc = instance.querySelector('.project-card__desc');
    const links = instance.querySelector('.project-card__links');

    if (media) {
      media.src = project.image || 'assets/images/projects/placeholder-1.jpg';
      media.alt = 'Preview of ' + (project.title || 'project');
    }
    if (date) {
      date.textContent = project.date || '';
    }
    if (tags && Array.isArray(project.tags)) {
      tags.innerHTML = '';
      project.tags.forEach(function (tag) {
        const pill = document.createElement('span');
        pill.className = 'project-card__tag';
        pill.textContent = tag;
        tags.appendChild(pill);
      });
    }
    if (title && project.title) {
      title.textContent = project.title;
    }
    if (desc && project.desc) {
      desc.textContent = project.desc;
    }
    if (links) {
      links.innerHTML = '';
      const projectLinks = project.links || {};
      const entries = Object.keys(projectLinks)
        .filter(function (key) {
          return Boolean(projectLinks[key]);
        })
        .map(function (key) {
          return [key, projectLinks[key]];
        });

      const labelMap = { github: 'GitHub', demo: 'Live Demo' };
      entries.forEach(function (entry) {
        const key = entry[0];
        const value = entry[1];
        const anchor = document.createElement('a');
        anchor.className = 'project-card__link';
        anchor.href = value;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = labelMap[key] || key;

        const icon = document.createElement('span');
        icon.className = 'project-card__link-icon';
        icon.textContent = key === 'github' ? 'GH' : '↗';
        anchor.insertBefore(icon, anchor.firstChild);

        links.appendChild(anchor);
      });
    }

    if (article) {
      article.setAttribute('tabindex', '0');
    }
    grid.appendChild(instance);
  });
}

function setupContact(config) {
  const socials = config && Array.isArray(config.socials) ? config.socials : [];
  const noteLink = document.querySelector('.contact__link');
  const emailSocial = socials.find(function (social) {
    return social.icon === 'mail' && Boolean(social.url);
  });

  if (noteLink) {
    const email = emailSocial && emailSocial.url && emailSocial.url.indexOf('mailto:') === 0
      ? emailSocial.url.replace('mailto:', '')
      : 'liew@example.com';
    noteLink.href = 'mailto:' + email;
    noteLink.textContent = email;
  }
}

function setupGooeyNav() {
  const root = document.querySelector('[data-gooey-nav]');
  state.controllers.nav = initGooeyNav(root, {
    reduceMotion: state.reduceMotion,
    onNavigate: handleNavClick
  });
}

function handleNavClick(id) {
  const target = document.getElementById(id);
  if (!target) return;

  const behavior = state.reduceMotion ? 'auto' : 'smooth';
  target.scrollIntoView({ behavior: behavior, block: 'start' });
}

function setupSectionsObserver() {
  const sections = document.querySelectorAll('[data-section]');
  if (!sections.length) return;

  if (state.observers.sections) {
    state.observers.sections.disconnect();
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries
        .filter(function (entry) {
          return entry.isIntersecting;
        })
        .sort(function (a, b) {
          return b.intersectionRatio - a.intersectionRatio;
        })
        .forEach(function (entry) {
          if (state.controllers.nav && typeof state.controllers.nav.setActive === 'function') {
            state.controllers.nav.setActive(entry.target.id);
          }
        });
    },
    { threshold: 0.55 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
  state.observers.sections = observer;
}

function initBlurEffects() {
  const target = document.querySelector('[data-blur-text]');
  initBlurText(target, { reduceMotion: state.reduceMotion });
}

function activateEnhancements() {
  const marqueeRoot = document.querySelector('[data-infinite-menu]');
  const floatTargets = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-float]'));
  const lightRaysContainer = document.getElementById('light-rays');
  const flowingRoot = document.querySelector('[data-flowing-menu]');

  destroyController(state.controllers.marquee);
  destroyController(state.controllers.scrollFloat);
  destroyController(state.controllers.lightRays);
  destroyController(state.controllers.flowingMenu);

  const config = state.config || {};
  const infiniteItems = config.infiniteMenu && Array.isArray(config.infiniteMenu.items)
    ? config.infiniteMenu.items
    : [];
  state.controllers.marquee = initInfiniteMenu(marqueeRoot, infiniteItems, {
    reduceMotion: state.reduceMotion
  });

  state.controllers.scrollFloat = initScrollFloat(floatTargets, {
    reduceMotion: state.reduceMotion
  });

  state.controllers.lightRays = initLightRays(lightRaysContainer, {
    reduceMotion: state.reduceMotion
  });

  const socials = (config.socials || []).map(function (social) {
    if (social.icon === 'mail' && !social.url) {
      const clone = Object.assign({}, social);
      clone.url = 'mailto:liew@example.com';
      return clone;
    }
    return social;
  });

  state.controllers.flowingMenu = initFlowingMenu(flowingRoot, socials, {
    reduceMotion: state.reduceMotion
  });
}

function setupScrollbar() {
  const scrollbar = document.querySelector('[data-scrollbar]');
  const track = scrollbar ? scrollbar.querySelector('.scrollbar__track') : null;
  const thumb = track ? track.querySelector('.scrollbar__thumb') : null;
  if (!scrollbar || !track || !thumb) return;

  document.documentElement.style.setProperty('--scrollbar-width', SCROLLBAR.widthPx + 'px');
  thumb.style.minHeight = SCROLLBAR.minThumbPx + 'px';
  thumb.style.opacity = String(SCROLLBAR.idleOpacity);

  let hideTimeout = null;

  function updateThumb() {
    const doc = document.documentElement;
    const scrollHeight = doc.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY || doc.scrollTop;
    const trackHeight = track.clientHeight;

    if (scrollHeight <= viewportHeight) {
      scrollbar.classList.remove('scrollbar--visible');
      return;
    }

    const ratio = viewportHeight / scrollHeight;
    const thumbHeight = Math.max(SCROLLBAR.minThumbPx, trackHeight * ratio);
    const maxOffset = trackHeight - thumbHeight;
    const progress = (scrollTop) / (scrollHeight - viewportHeight);
    const offset = maxOffset * progress;

    thumb.style.height = thumbHeight + 'px';
    thumb.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
  }

  function showScrollbar() {
    scrollbar.classList.add('scrollbar--visible');
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(function () {
      scrollbar.classList.remove('scrollbar--visible');
    }, 1200);
  }

  function handleScroll() {
    updateThumb();
    showScrollbar();
  }

  function handlePointerMove(event) {
    const distanceFromRight = window.innerWidth - event.clientX;
    if (distanceFromRight <= SCROLLBAR.revealEdgePx) {
      showScrollbar();
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', updateThumb);
  window.addEventListener('pointermove', handlePointerMove);
  updateThumb();
}

function destroyController(controller) {
  if (controller && typeof controller.destroy === 'function') {
    controller.destroy();
  }
}
