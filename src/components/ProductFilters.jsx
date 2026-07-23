import { useState } from "react";
import "./ProductFilters.css";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.1-4.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
  </svg>
);

const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/**
 * Prominent hero-style search bar for Shop & Collection product listings.
 * Filters apply to currently loaded products.
 */
const ProductFilters = ({ filters, onChange }) => {
  const [focused, setFocused] = useState(false);
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <section
      className={`pf${focused ? " is-focused" : ""}`}
      aria-label="Product search"
    >
      <span className="pf-search-badge" aria-hidden="true">
        <SearchIcon />
      </span>

      <div className="pf-search">
        <input
          type="search"
          className="pf-search-input"
          placeholder="Search products by name or SKU…"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="Search products"
        />
        <span className="pf-search-hint">
          {filters.search ? "Press Enter or keep typing" : "Try a product name…"}
        </span>
      </div>

      {filters.search ? (
        <button
          type="button"
          className="pf-search-clear"
          onClick={() => update({ search: "" })}
          aria-label="Clear search"
        >
          <ClearIcon />
        </button>
      ) : null}
    </section>
  );
};

export default ProductFilters;
