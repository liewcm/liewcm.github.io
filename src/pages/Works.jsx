import { useEffect, useRef, useState } from 'react';
import InfiniteMenu from '../../Reactbits/InfiniteMenu';
import content from '../data/content.json';

const projectImages = import.meta.glob('../assets/images/projects/*', {
  eager: true,
  import: 'default'
});

const resolveAsset = (assetsMap, relativePath) => {
  if (!relativePath) return '';
  const sanitized = relativePath.replace(/^[./]+/, '');
  const entry = Object.entries(assetsMap).find(([key]) => key.endsWith(`/${sanitized}`));
  return entry ? entry[1] : '';
};

const items =
  content.projects
    ?.map(project => ({
      image: resolveAsset(projectImages, project.src),
      link: project.href,
      title: project.title,
      description: project.description
    }))
    .filter(item => item.image) ?? [];

// Wordless hint that the globe can be dragged: a finger swiping between two arrows.
// Icons from Lucide (ISC license).
const DragHint = ({ hidden }) => (
  <div className={`drag-hint ${hidden ? 'is-hidden' : ''}`} aria-hidden="true">
    <div className="drag-hint-inner">
      <svg className="drag-hint-arrow drag-hint-arrow-left" viewBox="0 0 24 24">
        <path d="m15 18-6-6 6-6" />
      </svg>
      <svg className="drag-hint-hand" viewBox="0 0 24 24">
        <path d="M22 14a8 8 0 0 1-8 8" />
        <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
        <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
        <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" />
        <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
      <svg className="drag-hint-arrow drag-hint-arrow-right" viewBox="0 0 24 24">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  </div>
);

// How long after the user lets go of the globe before the hint comes back
const HINT_DELAY = 3000;

const Works = () => {
  const [isHintHidden, setIsHintHidden] = useState(false);
  const hintTimer = useRef(null);
  const releaseHandler = useRef(null);

  const stopListeningForRelease = () => {
    if (!releaseHandler.current) return;
    window.removeEventListener('pointerup', releaseHandler.current);
    window.removeEventListener('pointercancel', releaseHandler.current);
    releaseHandler.current = null;
  };

  useEffect(
    () => () => {
      clearTimeout(hintTimer.current);
      stopListeningForRelease();
    },
    []
  );

  // Hide the hint while the globe is being used, and bring it back once the user has let go
  // (the release can happen outside the globe, so listen on window)
  const handlePointerDown = () => {
    clearTimeout(hintTimer.current);
    setIsHintHidden(true);
    stopListeningForRelease();
    releaseHandler.current = () => {
      stopListeningForRelease();
      hintTimer.current = setTimeout(() => setIsHintHidden(false), HINT_DELAY);
    };
    window.addEventListener('pointerup', releaseHandler.current);
    window.addEventListener('pointercancel', releaseHandler.current);
  };

  return (
    <div className="page works-page">
      <h1 className="page-heading works-heading">Featured Works</h1>
      <div className="works-menu" onPointerDownCapture={handlePointerDown}>
        <InfiniteMenu items={items} />
        <DragHint hidden={isHintHidden} />
      </div>
    </div>
  );
};

export default Works;
