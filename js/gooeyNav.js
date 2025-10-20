export const NAV = {
  proximityPx: 64,
  pillRadius: 16,
  pillPadY: 8,
  pillPadX: 16,
  particleCount: [6, 12],
  particleMaxDist: 28,
  particleDurationMs: [250, 450]
};

export function initGooeyNav(root, { reduceMotion = false, onNavigate } = {}) {
  if (!root) {
    return { setActive: function noop() {} };
  }

  const items = Array.prototype.slice.call(root.querySelectorAll('.gooey-nav__item'));
  const pill = root.querySelector('[data-gooey-pill]');
  const particleLayer = root.querySelector('.gooey-nav__particle-layer');
  var currentId = items[0] ? items[0].dataset.target : null;
  var hoveredId = null;
  var rafId = null;

  function setActive(id, options) {
    options = options || {};
    currentId = id || currentId;
    var target = findItem(id);
    updateHighlight(target);
    if (options.spawn && target) {
      triggerParticles(target);
    }
  }

  function findItem(id) {
    for (var i = 0; i < items.length; i += 1) {
      if (items[i].dataset.target === id) {
        return items[i];
      }
    }
    return null;
  }

  function updateHighlight(target, options) {
    options = options || {};
    items.forEach(function (item) {
      var isActive = item === target;
      item.classList.toggle('gooey-nav__item--active', isActive);
      item.style.color = isActive ? '#000' : 'rgba(255, 255, 255, 0.7)';
    });

    if (!target || !pill) {
      if (pill) {
        pill.style.transform = 'scaleX(0)';
      }
      return;
    }

    var navRect = root.getBoundingClientRect();
    var itemRect = target.getBoundingClientRect();
    var width = itemRect.width + NAV.pillPadX * 2;
    var height = itemRect.height + NAV.pillPadY * 2;
    var x = itemRect.left - navRect.left - NAV.pillPadX;
    var y = itemRect.top - navRect.top - NAV.pillPadY;

    pill.style.borderRadius = NAV.pillRadius + 'px';
    pill.style.width = width + 'px';
    pill.style.height = height + 'px';
    pill.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) scaleX(1)';

    if (options.immediate) {
      pill.style.transition = 'none';
      requestAnimationFrame(function () {
        pill.style.removeProperty('transition');
      });
    }
  }

  function triggerParticles(target) {
    if (reduceMotion || !particleLayer) return;

    var layerRect = particleLayer.getBoundingClientRect();
    var itemRect = target.getBoundingClientRect();
    var centerX = itemRect.left + itemRect.width / 2 - layerRect.left;
    var centerY = itemRect.top + itemRect.height / 2 - layerRect.top;
    var minCount = NAV.particleCount[0];
    var maxCount = NAV.particleCount[1];
    var count = randomInt(minCount, maxCount);

    for (var i = 0; i < count; i += 1) {
      var particle = document.createElement('div');
      particle.className = 'gooey-nav__particle';
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      particleLayer.appendChild(particle);

      var angle = Math.random() * Math.PI * 2;
      var distance = Math.random() * NAV.particleMaxDist;
      var minDur = NAV.particleDurationMs[0];
      var maxDur = NAV.particleDurationMs[1];
      var duration = randomInt(minDur, maxDur);
      var translateX = Math.cos(angle) * distance;
      var translateY = Math.sin(angle) * distance;

      var animation = particle.animate(
        [
          { transform: 'translate3d(0, 0, 0) scale(0.6)', opacity: 0.9 },
          {
            transform: 'translate3d(' + translateX + 'px, ' + translateY + 'px, 0) scale(0.2)',
            opacity: 0
          }
        ],
        { duration: duration, easing: 'ease-out', fill: 'forwards' }
      );

      animation.finished
        .then(function () {
          particle.remove();
        })
        .catch(function () {
          particle.remove();
        });
    }
  }

  function handleClick(event) {
    var button = event.currentTarget;
    var id = button.dataset.target;
    setActive(id, { spawn: true });
    if (typeof onNavigate === 'function') {
      onNavigate(id);
    }
  }

  function handleFocus(event) {
    var id = event.currentTarget.dataset.target;
    hoveredId = id;
    updateHighlight(event.currentTarget);
  }

  function handleBlur() {
    hoveredId = null;
    var fallback = findItem(currentId);
    updateHighlight(fallback);
  }

  function handlePointerMove(event) {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(function () {
      var clientX = event.clientX;
      var clientY = event.clientY;
      var closest = null;
      var closestDist = Infinity;

      items.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        var dx = clientX - (rect.left + rect.width / 2);
        var dy = clientY - (rect.top + rect.height / 2);
        var dist = Math.hypot(dx, dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = item;
        }
      });

      if (closest && closestDist <= NAV.proximityPx) {
        if (hoveredId !== closest.dataset.target) {
          hoveredId = closest.dataset.target;
          updateHighlight(closest);
        }
      } else if (hoveredId) {
        hoveredId = null;
        updateHighlight(findItem(currentId));
      }
    });
  }

  function handlePointerLeave() {
    hoveredId = null;
    updateHighlight(findItem(currentId));
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  items.forEach(function (item) {
    item.addEventListener('click', handleClick);
    item.addEventListener('focus', handleFocus);
    item.addEventListener('blur', handleBlur);
  });

  root.addEventListener('pointermove', handlePointerMove);
  root.addEventListener('pointerleave', handlePointerLeave);

  window.addEventListener('resize', function () {
    var target = findItem(hoveredId || currentId);
    updateHighlight(target, { immediate: true });
  });

  updateHighlight(findItem(currentId), { immediate: true });

  return {
    setActive: function (id) {
      setActive(id);
    }
  };
}
