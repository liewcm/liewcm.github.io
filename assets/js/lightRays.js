const defaultOptions = {
  canvas: null,
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

const createRays = (canvas, width, height) => {
  const density = readCSSNumber("--rays-density", 0.25, canvas);
  const countMultiplier = readCSSNumber("--rays-count-multiplier", 42, canvas);
  const minCount = Math.max(
    1,
    Math.round(readCSSNumber("--rays-min-count", 6, canvas))
  );
  const speedBase = readCSSNumber("--rays-speed", 0.06, canvas);
  const speedVariance = readCSSNumber("--rays-speed-variance", 0.8, canvas);
  const thicknessMin = readCSSNumber("--rays-thickness-min", 0.6, canvas);
  const thicknessMax = readCSSNumber("--rays-thickness-max", 2.4, canvas);
  const opacityVariance = readCSSNumber("--rays-opacity-variance", 0.4, canvas);
  const opacityBase = readCSSNumber("--rays-opacity-base", 0.35, canvas);
  const lengthRatio = readCSSNumber("--rays-length-ratio", 1.6, canvas);
  const baseAngleDeg = readCSSNumber("--rays-base-angle-deg", -45, canvas);
  const angleVarianceDeg = readCSSNumber("--rays-angle-variance-deg", 12, canvas);

  const rayCount = Math.max(minCount, Math.round(density * countMultiplier));
  const diagonal = Math.hypot(width, height);
  const baseAngleRad = (baseAngleDeg * Math.PI) / 180;
  const angleVarianceRad = (angleVarianceDeg * Math.PI) / 180;

  const rays = [];
  for (let index = 0; index < rayCount; index += 1) {
    const baseAngle =
      baseAngleRad + (Math.random() - 0.5) * angleVarianceRad;
    const directionX = Math.cos(baseAngle);
    const directionY = Math.sin(baseAngle);
    const perpX = -directionY;
    const perpY = directionX;
    const speed =
      speedBase * (1 + (Math.random() - 0.5) * speedVariance);
    const thickness =
      thicknessMin + Math.random() * Math.max(0, thicknessMax - thicknessMin);
    const opacity = Math.max(
      0,
      Math.min(1, opacityBase + Math.random() * opacityVariance)
    );

    rays.push({
      directionX,
      directionY,
      perpX,
      perpY,
      offset: Math.random(),
      speed,
      thickness,
      opacity,
      length: diagonal * lengthRatio,
    });
  }

  return rays;
};

export const initLightRays = (options = defaultOptions) => {
  const { canvas, getReducedMotion, addMotionListener } = {
    ...defaultOptions,
    ...options,
  };

  if (!canvas) {
    return {};
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return {};
  }

  const hueShift = readCSSNumber("--rays-hue-shift", 0, canvas);
  const glowStrength = readCSSNumber("--rays-glow-strength", 0.28, canvas);

  const state = {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    rays: [],
    animationId: null,
    lastTimestamp: performance.now(),
  };

  const clearCanvas = () => {
    context.clearRect(0, 0, state.width, state.height);
  };

  const resizeCanvas = () => {
    state.width = canvas.clientWidth;
    state.height = canvas.clientHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = state.width * pixelRatio;
    canvas.height = state.height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    state.rays = createRays(canvas, state.width, state.height);
  };

  const drawFrame = (timestamp) => {
    const elapsed = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;

    clearCanvas();
    context.globalCompositeOperation = "lighter";

    state.rays.forEach((ray) => {
      ray.offset = (ray.offset + elapsed * ray.speed) % 1;

      const travel = (ray.offset - 0.5) * Math.hypot(state.width, state.height);
      const centerX = state.width / 2 + ray.perpX * travel;
      const centerY = state.height / 2 + ray.perpY * travel;
      const halfLength = ray.length / 2;

      const startX = centerX - ray.directionX * halfLength;
      const startY = centerY - ray.directionY * halfLength;
      const endX = centerX + ray.directionX * halfLength;
      const endY = centerY + ray.directionY * halfLength;

      context.lineWidth = ray.thickness;
      context.globalAlpha = Math.max(0, Math.min(1, ray.opacity));
      context.strokeStyle = `hsla(${hueShift}, 0%, 100%, ${ray.opacity})`;
      context.shadowColor = `hsla(${hueShift}, 0%, 100%, ${ray.opacity})`;
      context.shadowBlur = glowStrength * Math.max(state.width, state.height);

      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
    });

    if (!getReducedMotion()) {
      state.animationId = window.requestAnimationFrame(drawFrame);
    }
  };

  const stop = () => {
    if (state.animationId) {
      window.cancelAnimationFrame(state.animationId);
      state.animationId = null;
    }
    clearCanvas();
  };

  const start = () => {
    if (getReducedMotion()) {
      stop();
      return;
    }

    stop();
    state.lastTimestamp = performance.now();
    state.animationId = window.requestAnimationFrame(drawFrame);
  };

  const refresh = () => {
    resizeCanvas();
    start();
  };

  refresh();

  window.addEventListener("resize", refresh);
  addMotionListener((isReduced) => {
    if (isReduced) {
      stop();
    } else {
      start();
    }
  });

  return {
    refresh,
  };
};

export default initLightRays;
