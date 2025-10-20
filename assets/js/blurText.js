const defaultOptions = {
  elements: [],
  getReducedMotion: () => false,
  addMotionListener: () => () => {},
  threshold: 0.5,
};

export const initBlurText = (options = defaultOptions) => {
  const { elements, getReducedMotion, addMotionListener, threshold } = {
    ...defaultOptions,
    ...options,
  };

  const targets = Array.from(elements || []).filter(
    (element) => element instanceof HTMLElement
  );

  if (!targets.length) {
    return {};
  }

  const revealAll = () => {
    targets.forEach((target) => target.classList.add("is-visible"));
  };

  let observer = null;

  const setupObserver = () => {
    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: Math.min(0.99, Math.max(0, threshold)),
      }
    );

    targets
      .filter((target) => !target.classList.contains("is-visible"))
      .forEach((target) => observer.observe(target));
  };

  const refresh = () => {
    if (getReducedMotion()) {
      revealAll();
      if (observer) {
        observer.disconnect();
      }
      return;
    }

    setupObserver();
  };

  addMotionListener((isReduced) => {
    if (isReduced) {
      revealAll();
      if (observer) {
        observer.disconnect();
      }
    } else {
      setupObserver();
    }
  });

  refresh();

  return {
    refresh,
  };
};

export default initBlurText;
