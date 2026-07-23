/** Shared search/filter helpers used by the Shop & Collection listing pages. */

export const DEFAULT_PRODUCT_FILTERS = {
  search: "",
};

export function hasActiveProductFilters(filters) {
  return Boolean(filters.search?.trim());
}

export function filterAndSortProducts(products, filters) {
  if (!products?.length) return [];

  const query = filters.search.trim().toLowerCase();
  let list = products;

  if (query) {
    list = products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const sku = `sku-${String(p.id).padStart(4, "0")}`;
      const idStr = String(p.id);
      return name.includes(query) || sku.includes(query) || idStr.includes(query);
    });
  }

  return [...list].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
  );
}
