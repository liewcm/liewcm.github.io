export const MARQUEE = {
  speedPxPerSec: 40,
  gapPx: 48,
  pauseOnHover: true
};

export function initInfiniteMenu(container, items, options) {
  if (!container) return null;

  options = options || {};
  items = Array.isArray(items) ? items : [];

  const reduceMotion = Boolean(options.reduceMotion);
  const track = container.querySelector('[data-marquee-track]');
  if (!track || !items.length) return null;

  track.style.setProperty('--marquee-gap', String(MARQUEE.gapPx) + 'px');
  track.innerHTML = '';

  function buildItems() {
    return items.map(function (label) {
      const span = document.createElement('span');
      span.className = 'marquee__item';
      span.textContent = label;
      return span;
    });
  }

  const baseNodes = buildItems();
  baseNodes.forEach(function (node) {
    track.appendChild(node);
  });

  if (!reduceMotion) {
    const clones = buildItems();
    clones.forEach(function (node) {
      track.appendChild(node);
    });
  }

  let totalWidth = track.scrollWidth / (reduceMotion ? 1 : 2);
  let offset = 0;
  let lastTime;
  let paused = false;
  let rafId;

  function updateWidth() {
    totalWidth = track.scrollWidth / (reduceMotion ? 1 : 2);
  }

  function loop(timestamp) {
    if (reduceMotion || paused) {
      lastTime = timestamp;
      track.style.transform = 'translate3d(0, 0, 0)';
      rafId = requestAnimationFrame(loop);
      return;
    }

    if (typeof lastTime === 'undefined') {
      lastTime = timestamp;
      rafId = requestAnimationFrame(loop);
      return;
    }

    const deltaSeconds = (timestamp - lastTime) / 1000;
    offset -= MARQUEE.speedPxPerSec * deltaSeconds;

    if (totalWidth > 0 && Math.abs(offset) >= totalWidth) {
      offset += totalWidth;
    }

    track.style.transform = 'translate3d(' + offset + 'px, 0, 0)';

    lastTime = timestamp;
    rafId = requestAnimationFrame(loop);
  }

  function handleHover(state) {
    paused = state;
  }

  if (MARQUEE.pauseOnHover) {
    container.addEventListener('pointerenter', function () {
      handleHover(true);
    });
    container.addEventListener('pointerleave', function () {
      handleHover(false);
    });
  }

  window.addEventListener('resize', updateWidth);

  updateWidth();
  rafId = requestAnimationFrame(loop);

  return {
    destroy: function () {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateWidth);
    }
  };
}
