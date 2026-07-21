const NewsletterSection = () => {
  return (
    <section className="home-newsletter-section">
      <div className="home-newsletter-card home-animate-in">
        <div className="home-newsletter-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="home-newsletter-title home-heading">Subscribe to our emails</h2>
        <p className="home-newsletter-desc">
          Get insider news, seasonal box updates, and easy recipes straight to your inbox.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="home-newsletter-form">
          <input
            type="email"
            placeholder="Enter your email"
            aria-label="Email address"
            className="home-newsletter-input"
            required
          />
          <button type="submit" className="home-newsletter-submit">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
