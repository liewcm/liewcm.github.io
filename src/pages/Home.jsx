import BlurText from '../../Reactbits/BlurText';
import LightRays from '../../Reactbits/LightRays';

const Home = () => {
  return (
    <div className="page home-page">
      <LightRays className="home-light-rays" raysColor="#ffffff" raysOrigin="top-center" saturation={0.4} />
      <div className="home-content">
        <BlurText text="Welcome to my Portfolio" className="home-title" />
      </div>
    </div>
  );
};

export default Home;
