import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const shopItems = [
  { label: "Artisan Bakery", to: "/shop" },
  { label: "Farm Dairy", to: "/shop" },
  { label: "Ready to Eat", to: "/shop" },
  { label: "Produce Boxes", to: "/shop" },
  { label: "Butcher & Eggs", to: "/shop" },
  { label: "Pantry Essentials", to: "/shop" },
  { label: "Greens & Herbs", to: "/shop" },
  { label: "Seasonal Fruit", to: "/shop" },
];

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Fresh Boxes", to: "/shop" },
  { label: "Seasonal", to: "/shop" },
  { label: "Our Story", to: "/shop" },
  { label: "Get in Touch", to: "/shop" },
];

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="home-icon-svg" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const AccountIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="home-icon-svg" aria-hidden="true">
    <circle cx="12" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 20.5c0-3.5 3-5.5 7-5.5s7 2 7 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="home-icon-svg" aria-hidden="true">
    <path d="M7 7h13l-1.2 7H8.2L7 7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7 7L6 4H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9.5" cy="19" r="1" fill="currentColor" />
    <circle cx="16.5" cy="19" r="1" fill="currentColor" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="home-icon-svg" aria-hidden="true">
    <path d="M5 8h14M5 12h14M5 16h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="home-icon-svg" aria-hidden="true">
    <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="home-nav-chevron" aria-hidden="true">
    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="home-mobile-arrow" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 20.5c0-3.5 3-5.5 7-5.5s7 2 7 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const HeaderIcons = ({ cartCount }) => (
  <div className="home-icon-group">
    <button type="button" aria-label="Search" className="home-icon-btn">
      <SearchIcon />
      <span className="home-icon-tooltip">Search</span>
    </button>
    <Link to="/login" aria-label="Account" className="home-icon-btn">
      <AccountIcon />
      <span className="home-icon-tooltip">Account</span>
    </Link>
    <Link to="/cart" aria-label="Cart" className="home-icon-btn home-icon-btn-cart">
      <CartIcon />
      {cartCount > 0 && <span className="home-cart-badge">{cartCount}</span>}
      <span className="home-icon-tooltip">Cart</span>
    </Link>
  </div>
);

const HomeHeader = () => {
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);

  const closeMobileMenu = () => setMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const navLinkClass = ({ isActive }) =>
    `home-nav-link${isActive ? " active" : ""}`;

  const mobileNavLinkClass = ({ isActive }) =>
    `home-mobile-overlay-link${isActive ? " active" : ""}`;

  const mobileOverlay = (
    <div
      className={`home-mobile-overlay${menuOpen ? " is-open" : ""}`}
      aria-hidden={!menuOpen}
    >
      <div className="home-mobile-overlay-topbar">
        <button
          type="button"
          className="home-mobile-overlay-close"
          onClick={closeMobileMenu}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
        >
          <CloseIcon />
        </button>

        <Link to="/" className="home-mobile-overlay-logo" onClick={closeMobileMenu} tabIndex={menuOpen ? 0 : -1}>
          <span className="home-logo-text">Portlogiq</span>
          <span className="home-logo-sub">Farm &amp; Market</span>
        </Link>

        <div className="home-mobile-overlay-icons">
          <button type="button" aria-label="Search" className="home-icon-btn" tabIndex={menuOpen ? 0 : -1}>
            <SearchIcon />
          </button>
          <Link to="/cart" aria-label="Cart" className="home-icon-btn home-icon-btn-cart" onClick={closeMobileMenu} tabIndex={menuOpen ? 0 : -1}>
            <CartIcon />
            {cartCount > 0 && <span className="home-cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>

      <nav className="home-mobile-overlay-nav" aria-label="Mobile navigation">
        <ul className="home-mobile-overlay-list">
          <li>
            <NavLink to="/" end className={mobileNavLinkClass} onClick={closeMobileMenu} tabIndex={menuOpen ? 0 : -1}>
              Home
            </NavLink>
          </li>
          <li>
            <button
              type="button"
              className={`home-mobile-overlay-link home-mobile-overlay-trigger${mobileShopOpen ? " open" : ""}`}
              onClick={() => setMobileShopOpen(!mobileShopOpen)}
              aria-expanded={mobileShopOpen}
              tabIndex={menuOpen ? 0 : -1}
            >
              Shop
              <ArrowRightIcon />
            </button>
            {mobileShopOpen && (
              <ul className="home-mobile-overlay-submenu">
                {shopItems.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} onClick={closeMobileMenu} tabIndex={menuOpen ? 0 : -1}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          {navLinks.slice(1).map((link) => (
            <li key={link.label}>
              <NavLink to={link.to} className={mobileNavLinkClass} onClick={closeMobileMenu} tabIndex={menuOpen ? 0 : -1}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="home-mobile-overlay-footer">
        <Link to="/login" className="home-mobile-overlay-login" onClick={closeMobileMenu} tabIndex={menuOpen ? 0 : -1}>
          <PersonIcon />
          Log in
        </Link>
        <div className="home-mobile-overlay-socials">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" tabIndex={menuOpen ? 0 : -1}>
            <FacebookIcon />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" tabIndex={menuOpen ? 0 : -1}>
            <InstagramIcon />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="home-header-wrap">
      <div className="home-announcement">
        <span className="home-announcement-dot" />
        Free local delivery every Tuesday &amp; Friday
      </div>

      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-header-row">
            <div className="home-header-logo">
              <button
                type="button"
                className="home-menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
              <Link to="/" className="home-logo-link">
                <span className="home-logo-text">Portlogiq</span>
                <span className="home-logo-sub">Farm &amp; Market</span>
              </Link>
            </div>

            <nav className="home-header-nav" aria-label="Main navigation">
              <ul className="home-nav-list">
                <li>
                  <NavLink to="/" end className={navLinkClass}>
                    <span className="home-nav-text">Home</span>
                  </NavLink>
                </li>
                <li
                  className="home-nav-dropdown-wrap"
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                >
                  <button
                    type="button"
                    className={`home-nav-link home-nav-dropdown-trigger${shopOpen ? " open" : ""}`}
                    aria-expanded={shopOpen}
                    aria-haspopup="true"
                  >
                    <span className="home-nav-text">Shop</span>
                    <ChevronIcon />
                  </button>
                  <div className={`home-dropdown${shopOpen ? " is-visible" : ""}`}>
                    <div className="home-dropdown-header">
                      <p className="home-dropdown-label">Collections</p>
                      <Link to="/shop" className="home-dropdown-view-all">View all</Link>
                    </div>
                    <div className="home-dropdown-grid">
                      {shopItems.map((item) => (
                        <Link key={item.label} to={item.to} className="home-dropdown-item">
                          <span className="home-dropdown-item-dot" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
                {navLinks.slice(1).map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="home-nav-link">
                      <span className="home-nav-text">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="home-header-actions">
              <HeaderIcons cartCount={cartCount} />
            </div>
          </div>
        </div>
      </header>

      {createPortal(mobileOverlay, document.body)}
    </div>
  );
};

export default HomeHeader;
