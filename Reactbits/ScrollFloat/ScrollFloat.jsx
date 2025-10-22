import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollFloat.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03
}) => {
  const containerRef = useRef(null);

  const isStringChild = typeof children === 'string';

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split('').map((char, index) => (
      <span className="char" key={index}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const providedScroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : null;
    const snapRoot = document.getElementById('snap-root');
    const scroller = providedScroller ?? snapRoot ?? window;
    let animation;

    if (isStringChild) {
      const charElements = el.querySelectorAll('.char');
      if (!charElements.length) return;

      animation = gsap.fromTo(
        charElements,
        {
          willChange: 'opacity, transform',
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: '50% 0%'
        },
        {
          duration: animationDuration,
          ease: ease,
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          stagger: stagger,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: true
          }
        }
      );
    } else {
      animation = gsap.fromTo(
        el,
        {
          opacity: 0,
          yPercent: 20,
          willChange: 'opacity, transform'
        },
        {
          opacity: 1,
          yPercent: 0,
          duration: animationDuration,
          ease,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: true
          }
        }
      );
    }

    return () => {
      if (animation) {
        animation.scrollTrigger?.kill();
        animation.kill();
      }
    };
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger, isStringChild]);

  return (
    <div ref={containerRef} className={`scroll-float ${containerClassName}`}>
      {isStringChild ? (
        <span className={`scroll-float-text ${textClassName}`}>{splitText}</span>
      ) : (
        <div className={`scroll-float-content ${textClassName}`}>{children}</div>
      )}
    </div>
  );
};

export default ScrollFloat;
