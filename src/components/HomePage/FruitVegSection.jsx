import { Link } from "react-router-dom";

const collections = [
  {
    title: "Dairy",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80",
    link: "/shop",
  },
  {
    title: "Fruits & Vegetables Box",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80",
    link: "/shop",
  },
  {
    title: "Meat, Seafood, Eggs",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80",
    link: "/shop",
  },
];

const highlights = [
  {
    label: "Local delivery",
    detail: "Tuesdays & Fridays",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    label: "Market fresh",
    detail: "3 deliveries weekly",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Seasonal picks",
    detail: "Australian grown",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
];

const handleImgError = (e, fallback) => {
  if (fallback && e.currentTarget.src !== fallback) {
    e.currentTarget.src = fallback;
  }
};

const FruitVegSection = () => {
  return (
    <section className="home-produce-section">
      <div className="home-produce-bg" aria-hidden="true" />

      <div className="home-produce-container">
        <div className="home-produce-intro">
          <div className="home-produce-copy home-animate-in">
            <span className="home-produce-eyebrow">Fresh &amp; Seasonal</span>
            <h2 className="home-produce-title">Fruit + vegetables</h2>
            <p className="home-produce-text">
              We specialise in hand selected seasonal boxes of fresh fruit and vegetables for pick up daily or
              local home delivery on Tuesdays &amp; Fridays. If you live a little out of town, we&apos;ll put your
              order on the mail run.
            </p>
            <p className="home-produce-text">
              We support Australian Farmers and buy our fresh produce by the seasons — so you always get the best
              of what&apos;s fresh this season in the West, with Australian grown produce our next choice.
            </p>
            <Link to="/shop" className="home-produce-cta">
              Explore produce boxes
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="home-produce-highlights home-animate-in home-animate-delay-1">
            {highlights.map((item) => (
              <div key={item.label} className="home-produce-highlight">
                <div className="home-produce-highlight-icon">{item.icon}</div>
                <div>
                  <p className="home-produce-highlight-label">{item.label}</p>
                  <p className="home-produce-highlight-detail">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="home-produce-grid home-animate-in home-animate-delay-2">
          {collections.map((item, index) => (
            <Link
              key={item.title}
              to={item.link}
              className="home-produce-card"
              style={{ animationDelay: `${0.15 * index}s` }}
            >
              <div className="home-produce-card-media">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => handleImgError(e, item.fallback)}
                />
                <div className="home-produce-card-shade" />
              </div>
              <div className="home-produce-card-body">
                <h3>{item.title}</h3>
                <span className="home-produce-card-link">
                  Shop now
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

export default FruitVegSection;
