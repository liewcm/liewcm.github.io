import BlurText from '../../Reactbits/BlurText';
import SplashCursor from '../../Reactbits/SplashCursor';

const Home = () => {
  return (
    <div className="page home-page">
      <SplashCursor
        className="home-fluid"
        RAINBOW_MODE={false}
        COLOR="#f0f4ff"
        DENSITY_DISSIPATION={2}
        DYE_RESOLUTION={1024}
      />
      <div className="home-content">
        <BlurText text="Welcome to my Portfolio" className="home-title" />
      </div>
    </div>
  );
};

export default Home;
