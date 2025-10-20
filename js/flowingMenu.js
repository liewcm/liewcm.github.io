export const FLOW = {
  activationRadius: 120,
  orbitRadius: 56,
  drift: 0.15,
  reactiveness: 0.22
};

export function initFlowingMenu(root, socials, options) {
  if (!root) return null;

  socials = Array.isArray(socials) ? socials : [];
  options = options || {};
  const reduceMotion = Boolean(options.reduceMotion);

  const list = root.querySelector('[data-flowing-menu-items]');
  const template = document.getElementById('flowing-menu-item-template');
  if (!list || !template) return null;

  list.innerHTML = '';
  const fragment = document.createDocumentFragment();

  socials.forEach(function (social) {
    const node = template.content.cloneNode(true);
    const item = node.querySelector('.flowing-menu__item');
    const link = node.querySelector('.flowing-menu__link');
    const icon = node.querySelector('.flowing-menu__icon');
    const label = node.querySelector('.flowing-menu__text');

    link.href = social.url || '#';
    link.setAttribute('aria-label', social.name);
    link.dataset.social = social.name;
    if (!social.url) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
      });
    }

    if (icon && social.image) {
      icon.style.maskImage = 'url(' + social.image + ')';
      icon.style.webkitMaskImage = 'url(' + social.image + ')';
    }

    if (label) {
      label.textContent = social.name;
    }

    fragment.appendChild(node);
  });

  list.appendChild(fragment);

  const items = Array.prototype.slice.call(list.querySelectorAll('.flowing-menu__item'));
  if (!items.length) return null;

  if (reduceMotion) {
    root.classList.add('flowing-menu--static');
    items.forEach(function (item) {
      item.style.opacity = '1';
      item.style.position = 'relative';
      item.style.transform = 'none';
      item.style.left = 'auto';
      item.style.top = 'auto';
    });
    return null;
  }

  root.classList.remove('flowing-menu--static');

  const state = {
    bounds: root.getBoundingClientRect(),
    pointer: { x: 0, y: 0, active: false, inside: false },
    raf: null
  };

  const circle = items.map(function (item, index) {
    return {
      element: item,
      angle: (Math.PI * 2 * index) / items.length,
      radius: 0,
      targetRadius: 0,
      velocity: 0,
      opacity: 0
    };
  });

  function updateBounds() {
    state.bounds = root.getBoundingClientRect();
  }

  function handlePointer(event) {
    const clientX = event.clientX;
    const clientY = event.clientY;
    state.pointer.x = clientX;
    state.pointer.y = clientY;
    state.pointer.inside = isInside(clientX, clientY);
    state.pointer.active = true;
  }

  function handleLeave() {
    state.pointer.active = false;
    state.pointer.inside = false;
  }

  function handleTouch(event) {
    if (event.touches && event.touches[0]) {
      handlePointer(event.touches[0]);
    }
  }

  function isInside(x, y) {
    const bounds = state.bounds;
    return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
  }

  function loop() {
    const bounds = state.bounds;
    const pointer = state.pointer;
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
    const pointerX = pointer.x - bounds.left;
    const pointerY = pointer.y - bounds.top;
    const dx = pointerX - centerX;
    const dy = pointerY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const influence = pointer.inside ? clamp(0, 1, 1 - distance / FLOW.activationRadius) : 0;

    circle.forEach(function (item, index) {
      item.targetRadius = FLOW.orbitRadius * influence;
      item.radius += (item.targetRadius - item.radius) * FLOW.reactiveness;
      item.angle += (FLOW.drift * (0.4 + influence)) / (index + 1);
      item.opacity += ((influence > 0 ? 1 : 0) - item.opacity) * FLOW.reactiveness;

      const radius = item.radius;
      const angle = item.angle;
      const offsetX = Math.cos(angle) * radius + centerX + dx * 0.12 * influence;
      const offsetY = Math.sin(angle) * radius + centerY + dy * 0.12 * influence;

      item.element.style.left = offsetX + 'px';
      item.element.style.top = offsetY + 'px';
      item.element.style.opacity = Math.max(0.05, item.opacity).toFixed(2);
      item.element.style.transform = 'translate3d(-50%, -50%, 0) rotate(' + angle + 'rad)';
    });

    state.raf = requestAnimationFrame(loop);
  }

  function start() {
    stop();
    state.raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = null;
    }
  }

  function addListeners() {
    root.addEventListener('pointermove', handlePointer);
    root.addEventListener('pointerenter', handlePointer);
    root.addEventListener('pointerleave', handleLeave);
    root.addEventListener('touchstart', handleTouch, { passive: true });
    root.addEventListener('touchmove', handleTouch, { passive: true });
    root.addEventListener('touchend', handleLeave);
    window.addEventListener('resize', updateBounds);
  }

  function removeListeners() {
    root.removeEventListener('pointermove', handlePointer);
    root.removeEventListener('pointerenter', handlePointer);
    root.removeEventListener('pointerleave', handleLeave);
    root.removeEventListener('touchstart', handleTouch);
    root.removeEventListener('touchmove', handleTouch);
    root.removeEventListener('touchend', handleLeave);
    window.removeEventListener('resize', updateBounds);
  }

  updateBounds();
  addListeners();
  start();

  return {
    destroy: function () {
      stop();
      removeListeners();
    }
  };
}

function clamp(min, max, value) {
  return Math.min(Math.max(value, min), max);
}
