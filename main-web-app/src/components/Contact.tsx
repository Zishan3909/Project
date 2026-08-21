import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href="mailto:zishan3909@gmail.com" data-cursor="disable">
                zishan3909@gmail.com
              </a>
            </p>
            <h4>LeetCode</h4>
            <p>
              <a href="https://leetcode.com/u/Zishan0_0/" target="_blank" data-cursor="disable">
                leetcode.com/u/Zishan0_0
              </a>
            </p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href="https://github.com/Zishan3909"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward />
            </a>
            <a
              href="https://www.linkedin.com/in/zishan-ali-"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Linkedin <MdArrowOutward />
            </a>
            <a
              href="https://leetcode.com/u/Zishan0_0/"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              LeetCode <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>Zishan Ali</span>
            </h2>
            <h5>
              <MdCopyright /> 2026
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
