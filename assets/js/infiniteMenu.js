const defaultOptions = {
  element: null,
  items: [],
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

const normaliseItems = (items) =>
  Array.isArray(items) ? items.filter((item) => Boolean(item?.image)) : [];

const createItemNode = (item) => {
  const isLink = Boolean(item.url);
  const wrapper = document.createElement(isLink ? "a" : "div");
  wrapper.classList.add("infinite-item");

  if (isLink) {
    wrapper.classList.add("is-link");
    wrapper.setAttribute("href", item.url);
    wrapper.setAttribute("target", "_blank");
    wrapper.setAttribute("rel", "noopener noreferrer");
    wrapper.setAttribute("aria-label", "Open featured work in new tab");
  } else {
    wrapper.setAttribute("aria-hidden", "true");
  }

  const img = document.createElement("img");
  img.setAttribute("src", item.image);
  img.setAttribute("alt", "");
  img.setAttribute("loading", "lazy");

  wrapper.appendChild(img);
  return wrapper;
};

export const initInfiniteMenu = (options = defaultOptions) => {
  const { element, items, getReducedMotion, addMotionListener } = {
    ...defaultOptions,
    ...options,
  };

  if (!element) {
    return {};
  }

  const track = element.querySelector(".infinite-track");
  if (!track) {
    return {};
  }

  const render = () => {
    const sourceItems = normaliseItems(items);
    track.innerHTML = "";

    const duplicateCount = Math.max(
      1,
      Math.round(readCSSNumber("--marquee-duplicate", 2, element))
    );
    const pauseOnHover =
      readCSSNumber("--marquee-pause-on-hover", 1, element) > 0;

    for (let dupIndex = 0; dupIndex < duplicateCount; dupIndex += 1) {
      sourceItems.forEach((item) => {
        track.appendChild(createItemNode(item));
      });
    }

    track.dataset.pause = pauseOnHover ? "true" : "false";
    track.style.setProperty(
      "--marquee-shift",
      `${100 / Math.max(duplicateCount, 1)}%`
    );
  };

  const updateDuration = () => {
    const duplicateCount = Math.max(
      1,
      Math.round(readCSSNumber("--marquee-duplicate", 2, element))
    );
    const speed = Math.max(1, readCSSNumber("--marquee-speed-pps", 40, element));

    const totalWidth = track.scrollWidth;
    const baseWidth = totalWidth / duplicateCount;
    const durationSeconds = baseWidth / speed;

    track.style.setProperty("--marquee-duration", durationSeconds.toFixed(4));
  };

  const refresh = () => {
    render();
    window.requestAnimationFrame(updateDuration);
  };

  refresh();

  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(updateDuration);
    });

    observer.observe(element);
  }

  addMotionListener(() => {
    window.requestAnimationFrame(updateDuration);
  });

  if (getReducedMotion()) {
    element.classList.add("is-paused");
  }

  return {
    refresh,
  };
};

export default initInfiniteMenu;
