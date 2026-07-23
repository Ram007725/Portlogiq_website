import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./ProductListingTable.css";

const FALLBACK_IMG = "/img/default.png";

function unitPrice(p, unit) {
  const zonePrice = p.zone_prices?.find(
    (zp) => zp.unit_name === unit?.unit?.short_name
  )?.final_price;
  return Number(zonePrice ?? unit?.base_price ?? p.price ?? 0);
}

function unitLabelOf(unit) {
  return unit?.unit?.short_name || unit?.unit?.name || "";
}

function defaultUnitOf(p) {
  return (
    p.product_units?.find((u) => u.is_default_sale === 1) ||
    p.product_units?.find((u) => u.is_base === 1) ||
    p.product_units?.[0] ||
    null
  );
}

// Mirrors the pricing logic already used when adding items to the cart, so the
// price shown in the row always matches what actually gets charged. `selectedUnitId`
// lets a row override which unit's price/label to display (see the in-row unit picker).
function getPricing(p, selectedUnitId) {
  if (p.unit_type === "with_unit") {
    const unit =
      (selectedUnitId != null &&
        p.product_units?.find((u) => u.unit_id === selectedUnitId)) ||
      defaultUnitOf(p);
    return {
      price: unitPrice(p, unit),
      unitLabel: unitLabelOf(unit),
      unitId: unit?.unit_id ?? null,
    };
  }
  const price = Number(p.zone_prices?.[0]?.final_price ?? p.price ?? 0);
  return { price, unitLabel: "", unitId: null };
}

const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.912-4.784 2.208-7.395a49.86 49.86 0 00-.372-6.87M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
    />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 7.5h10.5l1.2 12.15a1.5 1.5 0 01-1.494 1.65H7.044a1.5 1.5 0 01-1.494-1.65L6.75 7.5z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5V6.75a3 3 0 116 0v3.75" />
  </svg>
);

const ProductListingTable = ({ products, onAddToCart }) => {
  const [quantities, setQuantities] = useState({});
  const [selectedUnitIds, setSelectedUnitIds] = useState({});
  const [bulkAdding, setBulkAdding] = useState(false);
  const dockRef = useRef(null);

  // Keep the bar fixed to the viewport while browsing, but lift it up when the
  // page footer enters the screen so it never overlaps (or slips behind) footer
  // content. Uses a bottom offset rather than switching to static positioning,
  // so the bar stays visible and reachable the whole time.
  // Re-bind when products arrive so the dock (which only mounts once we have
  // rows to show) gets its scroll listener attached on first paint.
  useEffect(() => {
    if (!products?.length) return undefined;

    const footer = document.querySelector("footer");
    const dock = dockRef.current;
    if (!footer || !dock) return undefined;

    let rafId = 0;

    const sync = () => {
      rafId = 0;
      const footerTop = footer.getBoundingClientRect().top;
      const overlap = Math.max(0, window.innerHeight - footerTop);
      dock.style.bottom = `${overlap}px`;
    };

    const onScrollOrResize = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) window.cancelAnimationFrame(rafId);
      dock.style.bottom = "";
    };
  }, [products?.length]);

  const getQty = (id) => quantities[id] || 0;

  // Always derive the next value from the latest state (not a value captured in the
  // render closure) so rapid consecutive clicks accumulate correctly instead of stalling.
  const changeQty = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  // Lets shoppers type a quantity directly (handy on mobile where the card layout
  // gives the stepper an editable center instead of only +/- taps). Non-numeric or
  // negative input just falls back to 0 rather than rejecting the keystroke.
  const setQtyDirect = (id, rawValue) => {
    const digitsOnly = rawValue.replace(/[^0-9]/g, "");
    const next = digitsOnly === "" ? 0 : Math.max(0, parseInt(digitsOnly, 10));
    setQuantities((prev) => ({ ...prev, [id]: next }));
  };

  const selectUnit = (productId, unitId) => {
    setSelectedUnitIds((prev) => ({ ...prev, [productId]: unitId }));
  };

  if (!products || products.length === 0) return null;

  // Users pick quantities across as many rows as they like, then add everything
  // to the cart in one go, instead of confirming each product individually.
  const selectedItems = products
    .map((p) => ({ product: p, qty: getQty(p.id) }))
    .filter((item) => item.qty > 0);

  const selectedCount = selectedItems.length;
  const selectedTotal = selectedItems.reduce((sum, item) => {
    const { price } = getPricing(item.product, selectedUnitIds[item.product.id]);
    return sum + price * item.qty;
  }, 0);

  const handleAddAll = async () => {
    if (!onAddToCart || selectedItems.length === 0) return;
    setBulkAdding(true);
    try {
      for (const item of selectedItems) {
        await onAddToCart(item.product, item.qty, selectedUnitIds[item.product.id] ?? null);
      }
      setQuantities({});
      toast.success("Items added to cart successfully.", {
        className: "brand-toast brand-toast--success",
        progressClassName: "brand-toast__progress",
      });
    } catch (err) {
      console.error("Bulk cart add failed:", err);
      toast.error("Failed to add items to cart!");
    } finally {
      setBulkAdding(false);
    }
  };

  return (
    <div className="plt-listing">
      <div className="plt-wrapper">
        <div className="plt-scroll">
          <table className="plt-table">
            <thead className="plt-thead">
              <tr>
                <th className="plt-th plt-col-product">Product</th>
                <th className="plt-th plt-col-price">Price</th>
                <th className="plt-th plt-center plt-col-unit">Unit</th>
                <th className="plt-th plt-center plt-col-qty">Quantity</th>
                <th className="plt-th plt-col-total">Total</th>
              </tr>
            </thead>
            <tbody>
            {products.map((p, idx) => {
              const { price, unitId } = getPricing(p, selectedUnitIds[p.id]);
              const qty = getQty(p.id);
              const img = p.images && p.images.length > 0 ? p.images[0] : FALLBACK_IMG;
              const unitOptions = p.unit_type === "with_unit" ? p.product_units || [] : [];
              const hasUnitChoice = unitOptions.length > 1;

              return (
                <tr
                  key={p.id}
                  className={`plt-row${qty > 0 ? " selected" : ""}`}
                  style={{ animationDelay: `${Math.min(idx, 10) * 0.04}s` }}
                >
                  <td className="plt-td plt-col-product">
                    <div className="plt-product-cell">
                      <div className="plt-thumb">
                        <img
                          src={img}
                          alt={p.name}
                          loading="lazy"
                          onError={(e) => {
                            if (!e.currentTarget.src.endsWith(FALLBACK_IMG)) {
                              e.currentTarget.src = FALLBACK_IMG;
                            }
                          }}
                        />
                      </div>
                      <div className="plt-product-info">
                        <Link to={`/product/${p.id}`} className="plt-name">
                          {p.name}
                        </Link>
                        <span className="plt-id">SKU-{String(p.id).padStart(4, "0")}</span>
                      </div>
                    </div>
                  </td>

                  <td className="plt-td plt-col-price">
                    <span className="plt-price">${price.toFixed(2)}</span>
                  </td>

                  <td className="plt-td plt-center plt-col-unit">
                    {!unitOptions.length && <span className="plt-unit-none">&minus;</span>}

                    {unitOptions.length === 1 && (
                      <span className="plt-unit-static">{unitLabelOf(unitOptions[0])}</span>
                    )}

                    {hasUnitChoice && unitOptions.length <= 3 && (
                      <div
                        className="plt-unit-toggle"
                        role="group"
                        aria-label={`Choose unit for ${p.name}`}
                      >
                        {unitOptions.map((u) => (
                          <button
                            key={u.unit_id}
                            type="button"
                            className={`plt-unit-pill${u.unit_id === unitId ? " active" : ""}`}
                            onClick={() => selectUnit(p.id, u.unit_id)}
                          >
                            {unitLabelOf(u)}
                          </button>
                        ))}
                      </div>
                    )}

                    {hasUnitChoice && unitOptions.length > 3 && (
                      <select
                        className="plt-unit-select"
                        value={unitId ?? ""}
                        onChange={(e) => selectUnit(p.id, Number(e.target.value))}
                        aria-label={`Choose unit for ${p.name}`}
                      >
                        {unitOptions.map((u) => (
                          <option key={u.unit_id} value={u.unit_id}>
                            {unitLabelOf(u)} &middot; ${unitPrice(p, u).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  <td className="plt-td plt-center plt-col-qty">
                    <div className={`plt-stepper${qty > 0 ? " has-qty" : ""}`}>
                      <button
                        type="button"
                        className="plt-stepper-btn plt-stepper-minus"
                        onClick={() => changeQty(p.id, -1)}
                        disabled={qty === 0}
                        aria-label={`Decrease quantity of ${p.name}`}
                      >
                        &minus;
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="plt-stepper-input"
                        value={qty}
                        onChange={(e) => setQtyDirect(p.id, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        aria-label={`Quantity of ${p.name}`}
                      />
                      <button
                        type="button"
                        className="plt-stepper-btn plt-stepper-plus"
                        onClick={() => changeQty(p.id, 1)}
                        aria-label={`Increase quantity of ${p.name}`}
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td className="plt-td plt-col-total">
                    <span className={`plt-row-total${qty === 0 ? " is-zero" : ""}`}>
                      ${(price * qty).toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Docked to the bottom of the viewport so the running total + Add to Cart
          stays within reach while browsing. As the page footer enters the screen,
          a scroll listener lifts this dock via `bottom` so it rides just above
          the footer instead of covering (or disappearing behind) it. */}
      <div className="plt-summary-dock" ref={dockRef}>
        <div className={`plt-summary${selectedCount > 0 ? " has-selection" : ""}`}>
          <div className="plt-summary-top">
            <div className="plt-summary-info">
              <span className="plt-summary-icon">
                <BagIcon />
              </span>
              <div className="plt-summary-copy">
                <span className="plt-summary-label">Grand Total</span>
                <span className="plt-summary-meta">
                  {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
                </span>
              </div>
            </div>

            <span className={`plt-summary-total${selectedCount === 0 ? " is-zero" : ""}`}>
              ${selectedTotal.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            className="plt-bulk-add-btn"
            onClick={handleAddAll}
            disabled={selectedItems.length === 0 || bulkAdding}
          >
            <AddIcon />
            {bulkAdding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductListingTable;
