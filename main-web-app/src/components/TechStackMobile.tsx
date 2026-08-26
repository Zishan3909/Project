import "./styles/TechStackMobile.css";

const techItems = [
  { name: "React", image: "/images/react2.webp" },
  { name: "Next.js", image: "/images/next2.webp" },
  { name: "Node.js", image: "/images/node2.webp" },
  { name: "Express", image: "/images/express.webp" },
  { name: "MongoDB", image: "/images/mongo.webp" },
  { name: "MySQL", image: "/images/mysql.webp" },
  { name: "TypeScript", image: "/images/typescript.webp" },
  { name: "JavaScript", image: "/images/javascript.webp" },
];

const TechStackMobile = () => {
  return (
    <div className="techstack-mobile">
      <h2 className="title">My Techstack</h2>
      <div className="techstack-mobile-grid">
        {techItems.map((item) => (
          <div className="techstack-mobile-item" key={item.name}>
            <img src={item.image} alt={item.name} loading="lazy" />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStackMobile;
