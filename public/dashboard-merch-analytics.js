// Merchandise sales and shipment analytics derived from the commercial payload.
export function createMerchAnalyticsRuntime(deps) {
  const {
    getCommercialPayload
  } = deps || {};

  function computeSubscriberMerchAnalytics() {
    const commercialPayload = getCommercialPayload?.();
    const merch = Array.isArray(commercialPayload?.merch) ? commercialPayload.merch : [];
    const items = merch.filter((item) => String(item?.status || "active").toLowerCase() !== "inactive");
    const shipments = items.flatMap((item) =>
      (Array.isArray(item?.shipments) ? item.shipments : []).map((shipment) => ({
        itemName: String(item?.name || "Product"),
        salePrice: Number(item?.salePrice || 0),
        baseShippingCost: Number(item?.shippingCost || 0),
        shippingFee: Number(shipment?.shippingFee ?? item?.shippingCost ?? 0),
        shippingStatus: String(shipment?.status || "preparing").trim().toLowerCase(),
        customerName: String(shipment?.customerName || "Customer"),
        trackingRef: String(shipment?.trackingRef || "").trim(),
        createdAt: shipment?.createdAt || null
      }))
    );
    const soldUnits = shipments.length;
    const revenue = shipments.reduce((sum, shipment) => sum + shipment.salePrice + shipment.shippingFee, 0);
    const cost = shipments.reduce((sum, shipment) => sum + shipment.baseShippingCost, 0);
    const profit = revenue - cost;
    const catalogValue = items.reduce((sum, item) => sum + Number(item?.salePrice || 0) * Number(item?.inventory || 0), 0);
    const topProducts = items
      .map((item) => {
        const productShipments = Array.isArray(item?.shipments) ? item.shipments : [];
        const sold = productShipments.length;
        const productRevenue = productShipments.reduce(
          (sum, shipment) => sum + Number(item?.salePrice || 0) + Number(shipment?.shippingFee ?? item?.shippingCost ?? 0),
          0
        );
        return {
          name: String(item?.name || "Product"),
          sold,
          stock: Math.max(0, Number(item?.inventory || 0)),
          revenue: productRevenue,
          shippingAvailable: Boolean(item?.shippingAvailable)
        };
      })
      .sort((a, b) => b.sold - a.sold || b.revenue - a.revenue);
    const preparing = shipments.filter((shipment) => shipment.shippingStatus === "preparing").length;
    const shipped = shipments.filter((shipment) => shipment.shippingStatus === "shipped").length;
    const delivered = shipments.filter((shipment) => shipment.shippingStatus === "delivered").length;
    const lowStock = topProducts.filter((item) => item.stock > 0 && item.stock <= 3).length;
    const recentShipments = shipments
      .slice()
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .slice(0, 4);
    return {
      items,
      shipments,
      soldUnits,
      revenue,
      cost,
      profit,
      catalogValue,
      topProducts,
      preparing,
      shipped,
      delivered,
      lowStock,
      recentShipments
    };
  }

  return {
    computeSubscriberMerchAnalytics
  };
}
