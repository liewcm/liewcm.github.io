import { useEffect, useMemo, useRef } from 'react';
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Works from './pages/Works.jsx';
import Contact from './pages/Contact.jsx';
import './App.css';

const ScrollablePages = () => {
  const scrollContainerRef = useRef(null);
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const worksRef = useRef(null);
  const contactRef = useRef(null);
  const isProgrammaticScroll = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  const sections = useMemo(
    () => [
      { key: 'home', path: '/', ref: homeRef },
      { key: 'about', path: '/about', ref: aboutRef },
      { key: 'works', path: '/works', ref: worksRef },
      { key: 'contact', path: '/contact', ref: contactRef }
    ],
    [homeRef, aboutRef, worksRef, contactRef]
  );

  const sectionMap = useMemo(() => {
    const map = {};
    sections.forEach(section => {
      map[section.key] = section;
      map[section.path] = section;
    });
    return map;
  }, [sections]);

  useEffect(() => {
    const key = location.pathname === '/' ? 'home' : location.pathname.replace('/', '');
    const targetSection = sectionMap[key] ?? sectionMap.home;
    if (targetSection?.ref.current) {
      isProgrammaticScroll.current = true;
      targetSection.ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const timeout = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 900);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [location.pathname, sectionMap]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return undefined;

    const observer = new IntersectionObserver(
      entries => {
        if (isProgrammaticScroll.current) return;

        const visibleSections = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleSections.length) return;

        const { target } = visibleSections[0];
        const key = target.dataset.section;
        const activeSection = sectionMap[key];
        if (!activeSection) return;

        if (location.pathname !== activeSection.path) {
          navigate(activeSection.path, { replace: true });
        }
      },
      {
        threshold: [0.55, 0.75],
        rootMargin: '-20% 0px -20% 0px',
        root: container
      }
    );

    sections.forEach(section => {
      if (section.ref.current) {
        observer.observe(section.ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [navigate, location.pathname, sections, sectionMap]);

  return (
    <main id="snap-root" ref={scrollContainerRef}>
      <section ref={homeRef} id="home" data-section="home" className="page-section">
        <Home />
      </section>
      <section ref={aboutRef} id="about" data-section="about" className="page-section">
        <About />
      </section>
      <section ref={worksRef} id="works" data-section="works" className="page-section">
        <Works />
      </section>
      <section ref={contactRef} id="contact" data-section="contact" className="page-section">
        <Contact />
      </section>
    </main>
  );
};

function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Header />
        <div className="app-main">
          <Routes>
            <Route path="/" element={<ScrollablePages />} />
            <Route path="/about" element={<ScrollablePages />} />
            <Route path="/works" element={<ScrollablePages />} />
            <Route path="/contact" element={<ScrollablePages />} />
            <Route path="*" element={<ScrollablePages />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
