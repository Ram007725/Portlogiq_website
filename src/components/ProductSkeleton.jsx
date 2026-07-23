import HeaderPage from "./HeaderPage.jsx";
import "./ProductSkeleton.css";

const ListingRows = ({ count = 7 }) =>
  Array.from({ length: count }, (_, i) => (
    <div className="psk-row" key={i} aria-hidden="true">
      <div className="psk-product">
        <div className="psk-bone psk-thumb" />
        <div className="psk-product-copy">
          <div className="psk-bone psk-name" />
          <div className="psk-bone psk-sku" />
        </div>
      </div>
      <div className="psk-bone psk-price" />
      <div className="psk-bone psk-unit" />
      <div className="psk-bone psk-qty" />
      <div className="psk-bone psk-total" />
    </div>
  ));

const ListingSkeleton = ({ withHeader }) => (
  <div className="psk-page" role="status" aria-live="polite" aria-busy="true">
    {withHeader ? <HeaderPage /> : null}
    <main className={withHeader ? "psk-main" : undefined}>
      <section className="psk-section">
        <div className="psk-container">
          <div className="psk-intro">
            <div className="psk-bone psk-eyebrow" />
            <div className="psk-bone psk-title" />
            <div className="psk-bone psk-subtitle" />
          </div>

          <div className="psk-shell">
            <div className="psk-bone psk-shell-label" />
            <div className="psk-shell-row">
              <div className="psk-bone psk-shell-media" />
              <div className="psk-shell-copy">
                <div className="psk-bone psk-shell-line" />
                <div className="psk-bone psk-shell-line short" />
              </div>
            </div>
          </div>

          <div className="psk-search">
            <div className="psk-search-badge" aria-hidden="true" />
            <div className="psk-search-copy">
              <div className="psk-bone psk-search-line" />
              <div className="psk-bone psk-search-line hint" />
            </div>
          </div>

          <div className="psk-table-wrap">
            <div className="psk-table-head" aria-hidden="true">
              <div className="psk-bone psk-th" />
              <div className="psk-bone psk-th" />
              <div className="psk-bone psk-th center" />
              <div className="psk-bone psk-th center" />
              <div className="psk-bone psk-th" />
            </div>
            <ListingRows />
          </div>

          <div className="psk-status">
            <span className="psk-spinner" aria-hidden="true" />
            <span>Loading products…</span>
          </div>
        </div>
      </section>
    </main>
  </div>
);

const DetailSkeleton = ({ withHeader }) => (
  <div className="psk-page" role="status" aria-live="polite" aria-busy="true">
    {withHeader ? <HeaderPage /> : null}
    <main className={withHeader ? "psk-main" : undefined}>
      <div className="psk-container">
        <div className="psk-detail">
          <div className="psk-detail-media">
            <div className="psk-bone psk-detail-hero" />
            <div className="psk-detail-thumbs">
              <div className="psk-bone psk-detail-thumb" />
              <div className="psk-bone psk-detail-thumb" />
              <div className="psk-bone psk-detail-thumb" />
              <div className="psk-bone psk-detail-thumb" />
            </div>
          </div>

          <div className="psk-detail-copy">
            <div className="psk-bone psk-detail-eyebrow" />
            <div className="psk-bone psk-detail-title" />
            <div className="psk-bone psk-detail-price" />
            <div className="psk-bone psk-detail-block" />
            <div className="psk-detail-meta">
              <div className="psk-bone psk-chip" />
              <div className="psk-bone psk-chip" />
              <div className="psk-bone psk-chip" />
            </div>
            <div className="psk-detail-actions">
              <div className="psk-bone psk-stepper" />
              <div className="psk-cta" aria-hidden="true" />
            </div>
            <div className="psk-status" style={{ justifyContent: "flex-start", marginTop: "1rem" }}>
              <span className="psk-spinner" aria-hidden="true" />
              <span>Loading product…</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

/**
 * @param {"listing" | "detail"} [variant="listing"]
 * @param {boolean} [withHeader=true] Keep site header visible while loading
 */
const ProductSkeleton = ({ variant = "listing", withHeader = true }) => {
  if (variant === "detail") {
    return <DetailSkeleton withHeader={withHeader} />;
  }
  return <ListingSkeleton withHeader={withHeader} />;
};

export default ProductSkeleton;
