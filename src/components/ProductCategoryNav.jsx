import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ProductCategoryNav.css";

const FALLBACK_IMG = "/img/default.png";

// Some category records come back from the API with a blank/whitespace-only
// name — fall back to something visible instead of rendering an empty row.
function categoryDisplayName(cat) {
  return cat?.name?.trim() || "Untitled category";
}

const AllIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
    />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.1-4.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/**
 * Searchable category dropdown for Shop & Collection listing pages.
 * Navigates via existing routes so cart, pagination, and product fetching stay untouched.
 */
const ProductCategoryNav = ({ activeId = null, onCategoriesLoaded }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false
  );

  const onLoadedRef = useRef(onCategoriesLoaded);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);
  onLoadedRef.current = onCategoriesLoaded;

  useEffect(() => {
    let cancelled = false;

    api
      .get("/api/store/categories")
      .then((res) => {
        if (cancelled) return;
        const list = res.data?.success ? res.data.data || [] : [];
        setCategories(list);
        onLoadedRef.current?.(list);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    if (isMobile) document.body.classList.add("pcn-lock");

    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 40);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("pcn-lock");
      window.clearTimeout(focusTimer);
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const activeCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(activeId)) || null,
    [categories, activeId]
  );

  const isAllActive = activeId == null;
  const activeName = isAllActive
    ? "All products"
    : activeCategory?.name?.trim() || "Untitled category";
  const activeImage = activeCategory?.image || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((cat) => {
      const name = categoryDisplayName(cat).toLowerCase();
      const desc = (cat.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [categories, query]);

  const close = () => setOpen(false);

  const selectAll = () => {
    close();
    navigate("/shop");
  };

  const selectCategory = (id) => {
    close();
    navigate(`/categoryproduct/${id}`);
  };

  if (!loaded || categories.length === 0) return null;

  const dropdown = open ? (
    <>
      {isMobile ? (
        <button
          type="button"
          className="pcn-backdrop"
          aria-label="Close category menu"
          onClick={close}
        />
      ) : null}

      <div
        className={`pcn-dropdown${isMobile ? " is-sheet" : ""}`}
        ref={panelRef}
        role="listbox"
        aria-label="Categories"
      >
        {isMobile ? (
          <div className="pcn-sheet-head">
            <span className="pcn-sheet-handle" aria-hidden="true" />
            <p className="pcn-sheet-title">Select category</p>
          </div>
        ) : null}

        <div className="pcn-search">
          <span className="pcn-search-icon" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            ref={searchRef}
            type="search"
            className="pcn-search-input"
            placeholder="Search categories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search categories"
          />
          {query ? (
            <button
              type="button"
              className="pcn-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <ClearIcon />
            </button>
          ) : null}
        </div>

        <div className="pcn-options">
          {(!query.trim() || "all products".includes(query.trim().toLowerCase()) || "full catalogue".includes(query.trim().toLowerCase())) && (
            <button
              type="button"
              role="option"
              aria-selected={isAllActive}
              className={`pcn-option${isAllActive ? " selected" : ""}`}
              onClick={selectAll}
            >
              <span className="pcn-option-media pcn-option-icon">
                <AllIcon />
              </span>
              <span className="pcn-option-copy">
                <span className="pcn-option-name">All products</span>
                <span className="pcn-option-meta">Full catalogue</span>
              </span>
              {isAllActive ? (
                <span className="pcn-option-check" aria-hidden="true">
                  <CheckIcon />
                </span>
              ) : null}
            </button>
          )}

          {filtered.map((cat) => {
            const selected = String(activeId) === String(cat.id);
            const img = cat.image || FALLBACK_IMG;

            return (
              <button
                key={cat.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={`pcn-option${selected ? " selected" : ""}`}
                onClick={() => selectCategory(cat.id)}
              >
                <span className="pcn-option-media">
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      if (!e.currentTarget.src.endsWith(FALLBACK_IMG)) {
                        e.currentTarget.src = FALLBACK_IMG;
                      }
                    }}
                  />
                </span>
                <span className="pcn-option-copy">
                  <span className="pcn-option-name">{categoryDisplayName(cat)}</span>
                  <span className="pcn-option-meta">
                    {cat.description?.trim() || "Shop now"}
                  </span>
                </span>
                {selected ? (
                  <span className="pcn-option-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                ) : null}
              </button>
            );
          })}

          {filtered.length === 0 && query.trim() ? (
            <p className="pcn-empty">No categories match “{query.trim()}”</p>
          ) : null}
        </div>
      </div>
    </>
  ) : null;

  return (
    <nav
      className={`pcn${open ? " is-open" : ""}`}
      aria-label="Product categories"
      ref={rootRef}
    >
      <div className={`pcn-shell${open ? " is-open" : ""}`}>
        <div className="pcn-label-row">
          <span className="pcn-label">Category</span>
          <span className="pcn-count">{categories.length}</span>
        </div>

        <button
          type="button"
          className={`pcn-trigger has-selection${open ? " is-open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={`pcn-trigger-media${isAllActive ? " is-icon" : ""}`}>
            {isAllActive ? (
              <AllIcon />
            ) : (
              <img
                src={activeImage || FALLBACK_IMG}
                alt=""
                onError={(e) => {
                  if (!e.currentTarget.src.endsWith(FALLBACK_IMG)) {
                    e.currentTarget.src = FALLBACK_IMG;
                  }
                }}
              />
            )}
          </span>
          <span className="pcn-trigger-copy">
            <span className="pcn-trigger-name">{activeName}</span>
            <span className="pcn-trigger-meta">
              {isAllActive ? "Full catalogue" : "Tap to change category"}
            </span>
          </span>
          <span className="pcn-trigger-chevron" aria-hidden="true">
            <ChevronIcon />
          </span>
        </button>

        {isMobile ? (open ? createPortal(dropdown, document.body) : null) : dropdown}
      </div>
    </nav>
  );
};

export default ProductCategoryNav;
