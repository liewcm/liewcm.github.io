import { initGooeyNav } from "./gooeyNav.js";
import { initInfiniteMenu } from "./infiniteMenu.js";
import { initLightRays } from "./lightRays.js";
import { initFlowingMenu } from "./flowingMenu.js";
import { initBlurText } from "./blurText.js";

const CONFIG_URL = "config.json";
const rootElement = document.documentElement;
const bodyElement = document.body;

const motionSubscribers = new Set();

const readCSSVariable = (name, element = rootElement) =>
  getComputedStyle(element).getPropertyValue(name).trim();

const readCSSNumber = (name, fallback = 0, element = rootElement) => {
  const raw = readCSSVariable(name, element);
  if (!raw) {
    return fallback;
  }

  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
};

const getReducedMotion = () => rootElement.classList.contains("reduced-motion");

const addMotionListener = (callback) => {
  if (typeof callback === "function") {
    motionSubscribers.add(callback);
  }

  return () => motionSubscribers.delete(callback);
};

const notifyMotionListeners = (value) => {
  motionSubscribers.forEach((callback) => {
    callback(value);
  });
};

const setReducedMotionState = (value) => {
  rootElement.classList.toggle("reduced-motion", value);
  notifyMotionListeners(value);
};

const setupMotionPreference = () => {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  setReducedMotionState(mediaQuery.matches);

  const handleChange = (event) => {
    setReducedMotionState(event.matches);
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);
  } else {
    mediaQuery.addListener(handleChange);
  }
};

const loadConfig = async () => {
  const response = await fetch(CONFIG_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load ${CONFIG_URL}`);
  }

  return response.json();
};

const applyMeta = (site) => {
  if (!site) {
    return;
  }

  if (site.title) {
    document.title = site.title;
  }

  if (site.description) {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", site.description);
    }
  }
};

const hydrateHero = (hero) => {
  if (!hero) {
    return;
  }

  const headlineEl = document.querySelector('[data-config-text="hero.headline"]');
  if (headlineEl) {
    headlineEl.textContent = hero.headline ?? "";
  }
};

const hydrateAbout = (about) => {
  if (!about) {
    return;
  }

  const imageEl = document.querySelector('[data-config-src="about.image"]');
  if (imageEl) {
    imageEl.setAttribute("src", about.image ?? "");
  }
};

const initSectionObserver = (setActive) => {
  const sections = Array.from(document.querySelectorAll("section[id]"));
  if (!sections.length || typeof setActive !== "function") {
    return;
  }

  const threshold = Math.min(
    0.99,
    Math.max(0, readCSSNumber("--section-active-threshold", 0.6))
  );

  const observer = new IntersectionObserver(
    (entries) => {
      let best = null;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        }
      });

      if (best && best.target.id) {
        setActive(best.target.id);
      }
    },
    {
      threshold: [threshold],
    }
  );

  sections.forEach((section) => observer.observe(section));
};

const initScrollState = () => {
  let scrollTimeout = null;

  const idleDelay = readCSSNumber("--scrollbar-idle-delay-ms", 320);
  const revealEdge = readCSSNumber("--scrollbar-reveal-edge", 20);

  const handleScroll = () => {
    bodyElement.classList.add("is-scrolling");
    if (scrollTimeout) {
      window.clearTimeout(scrollTimeout);
    }

    scrollTimeout = window.setTimeout(() => {
      bodyElement.classList.remove("is-scrolling");
    }, idleDelay);
  };

  const handlePointerMove = (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const distance = window.innerWidth - event.clientX;
    const shouldReveal = distance <= revealEdge;
    bodyElement.classList.toggle("scrollbar-reveal", shouldReveal);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerleave", () => {
    bodyElement.classList.remove("scrollbar-reveal");
  });
};

const initAboutFloat = () => {
  const section = document.getElementById("about");
  const container = section?.querySelector(".section__inner--about");
  if (!section || !container) {
    return;
  }

  let target = 0.5;
  let current = 0.5;
  let rafId = null;
  const snap = Math.max(0, Math.min(1, readCSSNumber("--about-float-snap", 0.18)));

  const render = () => {
    current += (target - current) * snap;
    container.style.setProperty("--about-float-progress", current.toFixed(4));

    if (Math.abs(current - target) > 0.001 && !getReducedMotion()) {
      rafId = window.requestAnimationFrame(render);
    } else {
      rafId = null;
    }
  };

  const updateTarget = () => {
    if (getReducedMotion()) {
      target = 0.5;
      current = 0.5;
      container.style.setProperty("--about-float-progress", "0.5");
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      return;
    }

    const rect = section.getBoundingClientRect();
    const viewportHeight = Math.max(window.innerHeight, 1);
    const viewportCenter = viewportHeight / 2;
    const elementCenter = rect.top + rect.height / 2;
    const offset = elementCenter - viewportCenter;
    const normalized = Math.max(-1, Math.min(1, offset / viewportHeight));

    target = (normalized + 1) / 2;
    if (!rafId) {
      rafId = window.requestAnimationFrame(render);
    }
  };

  updateTarget();
  window.addEventListener("scroll", updateTarget, { passive: true });
  window.addEventListener("resize", updateTarget);

  addMotionListener(updateTarget);
};

const initialise = async () => {
  setupMotionPreference();

  const navControl = initGooeyNav({
    element: document.querySelector(".gooey-nav"),
    getReducedMotion,
    addMotionListener,
  });

  const blurControl = initBlurText({
    elements: document.querySelectorAll(".hero-blur"),
    getReducedMotion,
    addMotionListener,
    threshold: readCSSNumber("--hero-blur-threshold", 0.55),
  });

  const lightControl = initLightRays({
    canvas: document.querySelector(".light-rays-canvas"),
    getReducedMotion,
    addMotionListener,
  });

  let config;

  try {
    config = await loadConfig();
  } catch (error) {
    console.error(error);
    return;
  }

  applyMeta(config.site);
  hydrateHero(config.hero);
  hydrateAbout(config.about);

  const infiniteControl = initInfiniteMenu({
    element: document.querySelector("[data-infinite-menu]"),
    items: config.works?.items ?? [],
    getReducedMotion,
    addMotionListener,
  });

  const flowingControl = initFlowingMenu({
    element: document.querySelector("[data-flowing-menu]"),
    contact: config.contact,
    getReducedMotion,
    addMotionListener,
  });

  initSectionObserver(navControl?.setActiveSection);
  initScrollState();
  initAboutFloat();

  if (typeof blurControl?.refresh === "function") {
    blurControl.refresh();
  }

  navControl?.setActiveSection?.("home");
  infiniteControl?.refresh?.();
  lightControl?.refresh?.();
  flowingControl?.refresh?.();
};

window.addEventListener("DOMContentLoaded", initialise);
