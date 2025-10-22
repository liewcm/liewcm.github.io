import { useRef, useEffect, useState, useCallback } from 'react';
import './GooeyNav.css';

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
  onItemSelect
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const colorPaletteRef = useRef(colors);

  useEffect(() => {
    colorPaletteRef.current = colors;
  }, [colors]);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const createParticle = useCallback((i, t, d, r) => {
    let rotate = noise(r / 10);
    const computeVector = (distance, pointIndex) => {
      const angle = ((360 + noise(8)) / particleCount) * pointIndex * (Math.PI / 180);
      return [distance * Math.cos(angle), distance * Math.sin(angle)];
    };
    const start = computeVector(d[0], particleCount - i);
    const end = computeVector(d[1] + noise(7), particleCount - i);

    return {
      start,
      end,
      time: t,
      scale: 1 + noise(0.2),
      color: colorPaletteRef.current[Math.floor(Math.random() * colorPaletteRef.current.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  }, [particleCount]);

  const makeParticles = useCallback(
    element => {
      const d = particleDistances;
      const r = particleR;
      const bubbleTime = animationTime * 2 + timeVariance;
      element.style.setProperty('--time', `${bubbleTime}ms`);

      for (let i = 0; i < particleCount; i++) {
        const t = animationTime * 2 + noise(timeVariance * 2);
        const p = createParticle(i, t, d, r);
        element.classList.remove('active');

        setTimeout(() => {
          const particle = document.createElement('span');
          const point = document.createElement('span');
          particle.classList.add('particle');
          particle.style.setProperty('--start-x', `${p.start[0]}px`);
          particle.style.setProperty('--start-y', `${p.start[1]}px`);
          particle.style.setProperty('--end-x', `${p.end[0]}px`);
          particle.style.setProperty('--end-y', `${p.end[1]}px`);
          particle.style.setProperty('--time', `${p.time}ms`);
          particle.style.setProperty('--scale', `${p.scale}`);
          particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
          particle.style.setProperty('--rotate', `${p.rotate}deg`);

          point.classList.add('point');
          particle.appendChild(point);
          element.appendChild(particle);
          requestAnimationFrame(() => {
            element.classList.add('active');
          });
          setTimeout(() => {
            try {
              element.removeChild(particle);
            } catch {
              // Do nothing
            }
          }, t);
        }, 30);
      }
    },
    [animationTime, createParticle, particleCount, particleDistances, particleR, timeVariance]
  );

  const updateEffectPosition = element => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  const activateIndex = useCallback(
    (liElement, index) => {
      if (!liElement || activeIndex === index) return false;

      setActiveIndex(index);
      updateEffectPosition(liElement);

      if (filterRef.current) {
        const particles = filterRef.current.querySelectorAll('.particle');
        particles.forEach(p => filterRef.current.removeChild(p));
      }

      if (textRef.current) {
        textRef.current.classList.remove('active');

        void textRef.current.offsetWidth;
        textRef.current.classList.add('active');
      }

      if (filterRef.current) {
        makeParticles(filterRef.current);
      }

      return true;
    },
    [activeIndex, makeParticles]
  );

  const handleClick = (e, index) => {
    if (onItemSelect) {
      e.preventDefault();
    }
    const liEl = e.currentTarget.parentElement;
    activateIndex(liEl, index);
    onItemSelect?.(items[index], index, e);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const liEl = e.currentTarget.parentElement;
      activateIndex(liEl, index);
      onItemSelect?.(items[index], index, e);
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add('active');
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex];
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  useEffect(() => {
    if (!navRef.current) return;
    const liElements = navRef.current.querySelectorAll('li');
    const targetLi = liElements[initialActiveIndex];
    if (targetLi) {
      const changed = activateIndex(targetLi, initialActiveIndex);
      if (!changed) {
        updateEffectPosition(targetLi);
        textRef.current?.classList.add('active');
      }
    } else if (activeIndex !== initialActiveIndex) {
      setActiveIndex(initialActiveIndex);
    }
  }, [initialActiveIndex, activateIndex, activeIndex]);

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav>
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li key={index} className={activeIndex === index ? 'active' : ''}>
              <a
                href={item.href}
                aria-current={activeIndex === index ? 'page' : undefined}
                onClick={e => handleClick(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef} />
      <span className="effect text" ref={textRef} />
    </div>
  );
};

export default GooeyNav;
