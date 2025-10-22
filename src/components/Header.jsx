import { useLocation, useNavigate } from 'react-router-dom';
import GooeyNav from '../../Reactbits/GooeyNav';

const NAV_ITEMS = [
  { label: 'Home', path: '/', href: '#/' },
  { label: 'About', path: '/about', href: '#/about' },
  { label: 'Works', path: '/works', href: '#/works' },
  { label: 'Contact', path: '/contact', href: '#/contact' }
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeIndex = NAV_ITEMS.findIndex(item => item.path === location.pathname);

  const handleSelect = item => {
    navigate(item.path);
  };

  return (
    <header className="app-header">
      <GooeyNav
        key={location.pathname}
        items={NAV_ITEMS}
        initialActiveIndex={activeIndex >= 0 ? activeIndex : 0}
        onItemSelect={handleSelect}
      />
    </header>
  );
};

export default Header;
