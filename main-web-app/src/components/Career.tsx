import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Diploma in CS Engineering</h4>
                <h5>State Board of Technical Education</h5>
              </div>
              <h3>2023 - 2026</h3>
            </div>
            <p>
              Acquired a solid foundation in programming principles, core data structures, object-oriented concepts, database designs, and web development fundamentals.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>B.Tech in CS & Engineering</h4>
                <h5>Lateral Entry</h5>
              </div>
              <h3>2026 - 2029</h3>
            </div>
            <p>
              Currently expanding knowledge in advanced analysis of algorithms, operating systems, compiler designs, database management, and system architecture.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Engineer Intern</h4>
                <h5>Seeking Opportunities</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Actively seeking software developer and engineering internships to collaborate with development teams, tackle real-world challenges, and write clean, scalable code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
