export const RAYS = {
  density: 0.35,
  speed: 0.08,
  opacity: 0.1,
  hueShift: 0
};

export function initLightRays(container, options) {
  if (!container) return null;

  options = options || {};
  const reduceMotion = Boolean(options.reduceMotion);

  cleanup(container);

  if (reduceMotion) {
    container.style.background = 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12), transparent 58%)';
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'presentation');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  let animationId = null;
  let rays = [];
  let lastTime = 0;

  function cleanupCanvas() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', handleResize);
  }

  function handleResize() {
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    generateRays();
  }

  function generateRays() {
    const area = canvas.width * canvas.height;
    const baseCount = Math.max(8, Math.round(Math.sqrt(area) * RAYS.density * 0.02));
    rays = new Array(baseCount).fill(null).map(function () {
      return {
        x: Math.random(),
        angle: -0.45 + Math.random() * 0.9,
        width: 40 + Math.random() * 120,
        phase: Math.random(),
        hue: (RAYS.hueShift + Math.random() * 10) % 360
      };
    });
  }

  function render(timestamp) {
    const time = timestamp || 0;
    const delta = Math.min(32, time - lastTime || 16);
    lastTime = time;

    ctx.fillStyle = 'rgba(0,0,0,0.045)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const speed = RAYS.speed * 0.001 * delta;

    rays.forEach(function (ray) {
      ray.phase = (ray.phase + speed) % 1;
      const centerX = ray.x * width;
      const offsetY = ray.phase * height * 2 - height;

      const tangent = Math.tan(ray.angle);
      const startX = centerX - tangent * height;
      const endX = centerX + tangent * height;

      const gradient = ctx.createLinearGradient(startX, -height, endX, height * 2);
      const colorA = 'hsla(' + ray.hue + ', 45%, 62%, ' + (RAYS.opacity * 0.32) + ')';
      const colorB = 'hsla(' + ray.hue + ', 52%, 68%, ' + RAYS.opacity + ')';
      gradient.addColorStop(0, 'rgba(255,255,255,0)');
      gradient.addColorStop(0.4, colorA);
      gradient.addColorStop(0.5, colorB);
      gradient.addColorStop(0.6, colorA);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.save();
      ctx.translate(0, offsetY);
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = gradient;
      ctx.lineWidth = ray.width;
      ctx.beginPath();
      ctx.moveTo(startX, -height);
      ctx.lineTo(endX, height * 2);
      ctx.stroke();
      ctx.restore();
    });

    animationId = requestAnimationFrame(render);
  }

  handleResize();
  window.addEventListener('resize', handleResize);
  animationId = requestAnimationFrame(render);

  return {
    destroy: cleanupCanvas
  };
}

function cleanup(container) {
  while (container.firstChild) {
    const child = container.firstChild;
    if (child instanceof HTMLCanvasElement) {
      const ctx = child.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, child.width, child.height);
    }
    container.removeChild(child);
  }
  container.style.background = '';
}
