import SFACLogo from '../assets/images/SFAC-Logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="footer-logo-box">
              <img src={SFACLogo} alt="SFAC Logo" />
            </div>
            <div className="footer-text">
              <p className="footer-copyright">
                © 2025 SFAC Hub - Saint Francis of Assisi College, Bacoor Campus
              </p>
              <p className="footer-developer">
                Developed by SFAC Students | Making campus life more efficient
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;