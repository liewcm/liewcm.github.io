const defaultOptions = {
  element: null,
  getReducedMotion: () => false,
  addMotionListener: () => () => {},
};

const readCSSVariable = (name, element) =>
  getComputedStyle(element).getPropertyValue(name).trim();

const readCSSNumber = (name, fallback, element) => {
  const raw = readCSSVariable(name, element);
  if (!raw) {
    return fallback;
  }

  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
};

export const initGooeyNav = (options = defaultOptions) => {
  const { element, getReducedMotion, addMotionListener } = {
    ...defaultOptions,
    ...options,
  };

  if (!element) {
    return {};
  }

  const listItems = Array.from(element.querySelectorAll(".gooey-nav__item"));
  if (!listItems.length) {
    return {};
  }

  const pill = element.querySelector(".gooey-nav__effect--pill");
  const particlesHost = element.querySelector(".gooey-nav__effect--particles");

  const particleCount = Math.max(
    0,
    Math.round(readCSSNumber("--gooey-particle-count", 6, element))
  );
  const particleDistance = readCSSNumber("--gooey-particle-distance", 40, element);
  const particleSize = readCSSNumber("--gooey-particle-size", 14, element);
  const pillScale = readCSSNumber("--gooey-pill-scale", 1, element);
  const pillTransition = readCSSNumber("--gooey-pill-transition-ms", 260, element);

  const particles = [];
  let activeItem = null;

  const createParticles = () => {
    if (!particlesHost) {
      return;
    }

    particlesHost.innerHTML = "";
    particles.length = 0;

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement("span");
      particle.className = "gooey-particle";
      particle.style.width = `${particleSize}px`;
      particle.style.height = `${particleSize}px`;
      particlesHost.appendChild(particle);
      particles.push(particle);
    }
  };

  createParticles();

  const clearHover = () => {
    listItems.forEach((item) => item.classList.remove("is-hover"));
  };

  const movePill = (item) => {
    if (!pill || !item) {
      return;
    }

    const link = item.querySelector(".gooey-nav__link");
    if (!link) {
      return;
    }

    const navRect = element.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    pill.style.width = `${linkRect.width}px`;
    pill.style.height = `${linkRect.height}px`;
    pill.style.left = `${linkRect.left - navRect.left}px`;
    pill.style.top = `${linkRect.top - navRect.top}px`;
    pill.style.right = "auto";
    pill.style.bottom = "auto";
    pill.style.transform = `translate3d(0, 0, 0) scale(${pillScale})`;
    pill.style.transitionDuration = `${pillTransition}ms`;
    pill.classList.add("is-visible");
  };

  const burstParticles = (item) => {
    if (!particles.length || getReducedMotion()) {
      return;
    }

    const link = item.querySelector(".gooey-nav__link");
    if (!link) {
      return;
    }

    const rect = link.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    particles.forEach((particle, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(1, particleCount);
      const distanceMultiplier = 0.5 + Math.random() * 0.5;
      const dx = Math.cos(angle) * particleDistance * distanceMultiplier;
      const dy = Math.sin(angle) * particleDistance * distanceMultiplier;

      particle.style.left = `${originX - element.getBoundingClientRect().left}px`;
      particle.style.top = `${originY - element.getBoundingClientRect().top}px`;
      particle.style.setProperty("--particle-dx", `${dx}px`);
      particle.style.setProperty("--particle-dy", `${dy}px`);

      particle.classList.remove("is-animating");
      void particle.offsetWidth;
      particle.classList.add("is-animating");
    });
  };

  const activateItem = (item, { cause = "section" } = {}) => {
    if (!item) {
      return;
    }

    const isHover = cause === "hover";

    if (isHover) {
      clearHover();
      item.classList.add("is-hover");
    } else if (item !== activeItem) {
      activeItem?.classList.remove("is-active");
      activeItem = item;
      activeItem.classList.add("is-active");
    }

    movePill(item);
    burstParticles(item);
  };

  const handlePointerEnter = (item) => () => {
    activateItem(item, { cause: "hover" });
  };

  const handlePointerLeave = () => {
    clearHover();
    if (activeItem) {
      movePill(activeItem);
    }
  };

  const handleFocus = (item) => () => {
    activateItem(item, { cause: "section" });
  };

  const setActiveSection = (sectionId) => {
    if (!sectionId) {
      return;
    }

    const match = listItems.find((item) => {
      const link = item.querySelector(".gooey-nav__link");
      return link?.dataset.section === sectionId;
    });

    if (match) {
      activateItem(match, { cause: "section" });
    }
  };

  listItems.forEach((item) => {
    const link = item.querySelector(".gooey-nav__link");
    if (!link) {
      return;
    }

    link.addEventListener("pointerenter", handlePointerEnter(item));
    link.addEventListener("focus", handleFocus(item));
    link.addEventListener("blur", handlePointerLeave);
  });

  element.addEventListener("mouseleave", handlePointerLeave);

  const handleResize = () => {
    if (activeItem) {
      movePill(activeItem);
    }
  };

  window.addEventListener("resize", handleResize);

  addMotionListener((isReduced) => {
    if (isReduced && pill) {
      pill.style.transitionDuration = "0ms";
    } else if (pill) {
      pill.style.transitionDuration = `${pillTransition}ms`;
    }
  });

  return {
    setActiveSection,
  };
};

export default initGooeyNav;
