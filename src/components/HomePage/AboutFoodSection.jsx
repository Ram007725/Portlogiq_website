import { Link } from "react-router-dom";

const AboutFoodSection = () => {
  return (
    <section className="home-about-section">
      <div className="home-about-card home-animate-in">
        <span className="home-about-quote" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-4v-10h10z" />
          </svg>
        </span>
        <h2 className="home-about-title home-heading">Serious lovers of food</h2>
        <p className="home-about-text">
          When we say we love food, we really mean it. Our team are tasked with the hard yards of product testing
          (poor sods) so they can chat about amazing new produce and goods as they hit the shelves and what to do
          with them. Check our socials for family-friendly recipes and easy dinner shortcuts for busy people.
        </p>
        <Link to="/shop" className="home-btn-outline">About us</Link>
      </div>
    </section>
  );
};

export default AboutFoodSection;
