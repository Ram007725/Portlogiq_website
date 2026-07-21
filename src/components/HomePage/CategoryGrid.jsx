import { Link } from "react-router-dom";

const categories = [
  {
    title: "Easy Meals",
    subtitle: "Ready when you are",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    link: "/shop",
  },
  {
    title: "Bakery",
    subtitle: "Freshly baked daily",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80",
    link: "/shop",
  },
  {
    title: "Fruits & Vegetables Box",
    subtitle: "Seasonal & hand-picked",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80",
    link: "/shop",
  },
];

const handleImgError = (e, fallback) => {
  if (fallback && e.currentTarget.src !== fallback) {
    e.currentTarget.src = fallback;
  }
};

const CategoryGrid = () => {
  return (
    <section className="home-love-section">
      <div className="home-love-bg" aria-hidden="true" />

      <div className="home-love-container">
        <header className="home-love-header home-animate-in">
          <span className="home-love-eyebrow">Our collections</span>
          <h2 className="home-love-title">We love food!</h2>
          <p className="home-love-desc">
            Portlogiq is a family owned and operated general store in the little coastal town of
            Esperance, WA. We sell fresh fruit and vegetables, meat, eggs and dairy, small batch artisan wares,
            international specialist foods and more with a focus on local producers that are using traditional,
            sustainable and regenerative practices.
          </p>
        </header>

        <div className="home-love-grid">
          {categories.map((cat, index) => (
            <Link
              key={cat.title}
              to={cat.link}
              className="home-love-card home-animate-in"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="home-love-card-media">
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  onError={(e) => handleImgError(e, cat.fallback)}
                />
                <div className="home-love-card-overlay" />
              </div>
              <div className="home-love-card-content">
                <span className="home-love-card-index">0{index + 1}</span>
                <div>
                  <h3 className="home-love-card-title">{cat.title}</h3>
                  <p className="home-love-card-subtitle">{cat.subtitle}</p>
                </div>
                <span className="home-love-card-cta">
                  Explore
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
