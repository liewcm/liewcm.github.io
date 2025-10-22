import ScrollFloat from '../../Reactbits/ScrollFloat';
import profileImage from '../assets/images/profile/myimage.png';

const aboutLines = [
  'Hi!',
  'My name is Liew Cheah Ming,',
  'I am a year 4 Artificial',
  'Intelligence student studying in',
  'Xiamen University Malaysia'
];

const About = () => {
  return (
    <div className="page about-page">
      <h1 className="page-heading">About Me</h1>
      <div className="about-content">
        <ScrollFloat containerClassName="about-image-float">
          <img src={profileImage} alt="Liew Cheah Ming" className="about-image" />
        </ScrollFloat>
        <ScrollFloat containerClassName="about-text-float">
          <div className="about-text-block">
            {aboutLines.map(line => (
              <p key={line} className="about-text-line">
                {line}
              </p>
            ))}
          </div>
        </ScrollFloat>
      </div>
    </div>
  );
};

export default About;
