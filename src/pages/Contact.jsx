import FlowingMenu from '../../Reactbits/FlowingMenu';
import content from '../data/content.json';

const iconImages = import.meta.glob('../assets/images/icons/*', {
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
  content.contacts
    ?.map(contact => ({
      href: contact.href,
      label: contact.label,
      icon: resolveAsset(iconImages, contact.icon)
    }))
    .filter(item => item.icon) ?? [];

const Contact = () => {
  return (
    <div className="page contact-page">
      <h1 className="page-heading contact-heading">Get In Touch</h1>
      <div className="contact-menu">
        <FlowingMenu items={items} />
      </div>
    </div>
  );
};

export default Contact;
