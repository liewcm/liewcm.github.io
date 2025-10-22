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

const Works = () => {
  return (
    <div className="page works-page">
      <h1 className="page-heading works-heading">Featured Works</h1>
      <div className="works-menu">
        <InfiniteMenu items={items} />
      </div>
    </div>
  );
};

export default Works;
