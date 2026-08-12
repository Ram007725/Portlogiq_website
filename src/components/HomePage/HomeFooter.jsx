import { Link } from "react-router-dom";

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const paymentMethods = ["American Express", "Apple Pay", "Google Pay", "Mastercard", "Shop Pay", "Union Pay", "Visa"];

const HomeFooter = () => {
  return (
    <footer className="home-footer">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="home-footer-title">Find Us</h3>
            <address className="not-italic text-sm leading-relaxed space-y-1" style={{ color: "var(--home-text-muted)" }}>
              <p>73 Dempster Street</p>
              <p>Esperance, Western Australia 6450</p>
              <p className="pt-3">Monday - Friday: 9am - 5pm</p>
              <p>Saturday: 9am - 12:30pm</p>
              <p>Sunday: Closed</p>
              <p className="pt-3">
                Email us:{" "}
                <a href="mailto:hello@portlogiq.com" className="home-footer-link underline">
                  hello@portlogiq.com
                </a>
              </p>
            </address>
            <p className="text-xs mt-6 leading-relaxed max-w-md" style={{ color: "var(--home-text-muted)" }}>
              Portlogiq acknowledges the Kepa Kurl Wudjari people of the Nyungar nation and Ngadju people who are
              the traditional custodians of this land and their continuing connection to land, waters and community.
            </p>
          </div>

          <div>
            <h3 className="home-footer-title">More Info</h3>
            <ul className="space-y-2">
              <li><Link to="/shop" className="home-footer-link">About Us</Link></li>
              <li><Link to="/shop" className="home-footer-link">Return &amp; Refund Policy</Link></li>
              <li><Link to="/shop" className="home-footer-link">Terms of Service</Link></li>
            </ul>
            <div className="flex gap-4 mt-6" style={{ color: "var(--home-charcoal)" }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="home-icon-btn">
                <FacebookIcon />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="home-icon-btn">
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-6" style={{ borderColor: "var(--home-border)" }}>
          <p className="text-xs mb-3 text-center" style={{ color: "var(--home-text-muted)" }}>Payment methods</p>
          <div className="flex flex-wrap justify-center gap-2">
            {paymentMethods.map((method) => (
              <span key={method} className="home-payment-badge">{method}</span>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-xs space-y-2" style={{ color: "var(--home-text-muted)" }}>
          <p>&copy; 2026, Portlogiq – General Store</p>
          <div className="flex justify-center gap-4">
            <Link to="/shop" className="home-footer-link">Refund policy</Link>
            <Link to="/shop" className="home-footer-link">Privacy policy</Link>
            <Link to="/shop" className="home-footer-link">Terms of service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
