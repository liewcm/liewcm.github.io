const defaultOptions = {
  element: null,
  contact: null,
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

const createContactItem = (label, contact) => {
  const listItem = document.createElement("li");
  listItem.classList.add("flowing-item");

  const link = document.createElement("a");
  link.classList.add("flowing-link");

  const href = contact?.links?.[label] ?? "";
  if (href) {
    link.setAttribute("href", href);
    link.setAttribute("target", href.startsWith("mailto:") ? "_self" : "_blank");
    if (!href.startsWith("mailto:")) {
      link.setAttribute("rel", "noopener noreferrer");
    }
  } else {
    link.setAttribute("href", "#");
    link.dataset.disabled = "true";
  }

  link.setAttribute("tabindex", "-1");
  link.setAttribute("aria-label", `Open ${label} in new tab`);

  const icon = document.createElement("img");
  icon.classList.add("flowing-icon");
  icon.setAttribute("alt", "");
  icon.setAttribute("aria-hidden", "true");

  const iconSrc = contact?.icons?.[label];
  if (iconSrc) {
    icon.setAttribute("src", iconSrc);
  }

  const labelNode = document.createElement("span");
  labelNode.classList.add("flowing-label");
  labelNode.textContent = label;

  link.append(icon, labelNode);
  listItem.appendChild(link);

  return {
    node: listItem,
    link,
    icon,
    label,
    currentOffset: 0,
    targetOffset: 0,
    isVisible: false,
  };
};

export const initFlowingMenu = (options = defaultOptions) => {
  const { element, contact, getReducedMotion, addMotionListener } = {
    ...defaultOptions,
    ...options,
  };

  if (!element || !contact) {
    return {};
  }

  element.innerHTML = "";

  const order = Array.isArray(contact.order) ? contact.order : [];
  const items = order.map((label) => createContactItem(label, contact));
  items.forEach((item) => element.appendChild(item.node));

  const radius = () => readCSSNumber("--flow-activation-radius", 120, element);
  const drift = () => readCSSNumber("--flow-drift", 0.15, element);
  const reactiveness = () => readCSSNumber("--flow-reactiveness", 0.22, element);

  let pointerX = 0;
  let pointerY = 0;
  let frameId = null;
  let touchMode = false;

  const setVisibility = (item, visible) => {
    if (item.isVisible === visible) {
      return;
    }

    item.isVisible = visible;
    item.node.classList.toggle("is-visible", visible);
    item.link.setAttribute("tabindex", visible ? "0" : "-1");
  };

  const applyOffsets = () => {
    const smoothing = reactiveness();
    let needsAnimation = false;

    items.forEach((item) => {
      item.currentOffset += (item.targetOffset - item.currentOffset) * smoothing;

      if (Math.abs(item.currentOffset - item.targetOffset) > 0.5) {
        needsAnimation = true;
      }

      item.node.style.setProperty("--flow-offset", item.currentOffset.toFixed(2));
    });

    if (needsAnimation && !getReducedMotion()) {
      frameId = window.requestAnimationFrame(applyOffsets);
    } else {
      frameId = null;
    }
  };

  const scheduleOffsets = () => {
    if (!frameId) {
      frameId = window.requestAnimationFrame(applyOffsets);
    }
  };

  const evaluatePointer = () => {
    const activationRadius = radius();
    const maxDrift = drift() * activationRadius;

    items.forEach((item, index) => {
      if (touchMode || getReducedMotion()) {
        setVisibility(item, true);
        item.targetOffset = 0;
        return;
      }

      const rect = item.node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(pointerX - centerX, pointerY - centerY);
      const visibilityAmount = Math.max(
        0,
        Math.min(1, 1 - distance / activationRadius)
      );
      const visible = visibilityAmount > 0;

      setVisibility(item, visible);

      const direction = index % 2 === 0 ? 1 : -1;
      item.targetOffset = direction * maxDrift * visibilityAmount;
    });

    scheduleOffsets();
  };

  const handlePointerMove = (event) => {
    if (touchMode || getReducedMotion()) {
      return;
    }

    if (event.pointerType === "touch") {
      return;
    }

    pointerX = event.clientX;
    pointerY = event.clientY;
    evaluatePointer();
  };

  const handlePointerLeave = () => {
    if (touchMode || getReducedMotion()) {
      return;
    }

    items.forEach((item) => {
      setVisibility(item, false);
      item.targetOffset = 0;
    });
    scheduleOffsets();
  };

  const enableTouchMode = () => {
    touchMode = true;
    element.classList.add("is-touch");
    items.forEach((item) => {
      setVisibility(item, true);
      item.targetOffset = 0;
    });
    scheduleOffsets();
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === "touch") {
      enableTouchMode();
    }
  };

  window.addEventListener("pointermove", handlePointerMove);
  element.addEventListener("pointerleave", handlePointerLeave);
  element.addEventListener("pointerdown", handlePointerDown);

  element.addEventListener("click", (event) => {
    const target = event.target.closest(".flowing-link");
    if (target?.dataset.disabled === "true") {
      event.preventDefault();
    }
  });

  addMotionListener((isReduced) => {
    if (isReduced) {
      enableTouchMode();
    }
  });

  if (getReducedMotion()) {
    enableTouchMode();
  }

  return {
    refresh: () => {
      evaluatePointer();
    },
  };
};

export default initFlowingMenu;
