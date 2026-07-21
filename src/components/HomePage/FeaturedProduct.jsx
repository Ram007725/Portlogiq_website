import { Link } from "react-router-dom";

const FeaturedProduct = () => {
  return (
    <section className="home-featured-section">
      <div className="home-featured-container">
        <div className="home-featured-card">
          {/* Image side */}
          <div className="home-featured-media">
            <img
              src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1200&q=80"
              alt="Fruit & Vegetable Box"
              loading="lazy"
            />
            <span className="home-featured-badge">Staff Pick</span>
          </div>

          {/* Content side */}
          <div className="home-featured-content">
            <p className="home-featured-eyebrow">Anna&apos;s favourite of the week</p>
            <h2 className="home-featured-title">Fruit &amp; Vegetable Box</h2>
            <p className="home-featured-desc">
              A hand-selected seasonal mix of the freshest local produce — perfect for
              healthy meals all week. Delivered to your door on Tuesdays &amp; Fridays.
            </p>

            <div className="home-featured-price-row">
              <span className="home-featured-price">$95.00 AUD</span>
              <span className="home-featured-price-note">Free local delivery</span>
            </div>

            <div className="home-featured-tags">
              <span className="home-featured-tag">Seasonal</span>
              <span className="home-featured-tag">Australian Grown</span>
              <span className="home-featured-tag">Family Size</span>
            </div>

            <Link to="/shop" className="home-featured-cta">
              Shop this box
              <svg className="home-featured-cta-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;
