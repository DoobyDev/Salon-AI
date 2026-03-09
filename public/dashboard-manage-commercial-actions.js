// Managed commercial and merch actions extracted from the global dashboard click handler.
export function createManageCommercialActionsRuntime(deps) {
  const {
    openManageForm,
    openManageConfirm,
    showManageToast,
    getCommercialPayload,
    setCommercialStatus,
    setMerchStatus,
    upsertMembership,
    upsertPackage,
    issueGiftCard,
    upsertMerchItem,
    createMerchShipment,
    focusModuleByKey,
    merchNameInput
  } = deps || {};

  async function handleManageCommercialClick(target) {
    if (!(target instanceof HTMLElement)) return false;

    if (target.id === "manageAddMembership") {
      const values = await openManageForm?.({
        title: "Add Membership",
        submitLabel: "Save",
        fields: [
          { id: "name", label: "Membership Name", required: true },
          { id: "price", label: "Price", type: "number", required: true, value: "0" },
          { id: "billingCycle", label: "Billing Cycle", value: "monthly" },
          { id: "benefits", label: "Benefits" }
        ]
      });
      if (!values) return true;
      const name = String(values.name || "").trim();
      const price = Number(values.price || 0);
      const billingCycle = String(values.billingCycle || "monthly").trim();
      const benefits = String(values.benefits || "").trim();
      try {
        setCommercialStatus?.("Saving membership...");
        await upsertMembership?.({ name, price, billingCycle, benefits, status: "active" });
        setCommercialStatus?.("Membership saved.");
        showManageToast?.("Membership added.");
      } catch (error) {
        setCommercialStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.id === "manageAddPackage") {
      const values = await openManageForm?.({
        title: "Add Package",
        submitLabel: "Save",
        fields: [
          { id: "name", label: "Package Name", required: true },
          { id: "price", label: "Price", type: "number", required: true, value: "0" },
          { id: "sessionCount", label: "Session Count", type: "number", required: true, value: "1" }
        ]
      });
      if (!values) return true;
      const name = String(values.name || "").trim();
      const price = Number(values.price || 0);
      const sessionCount = Number(values.sessionCount || 1);
      try {
        setCommercialStatus?.("Saving package...");
        await upsertPackage?.({ name, price, sessionCount, status: "active" });
        setCommercialStatus?.("Package saved.");
        showManageToast?.("Package added.");
      } catch (error) {
        setCommercialStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.id === "manageAddGiftCard") {
      const values = await openManageForm?.({
        title: "Issue Gift Card",
        submitLabel: "Issue",
        fields: [
          { id: "purchaserName", label: "Purchaser Name", required: true },
          { id: "recipientName", label: "Recipient Name", required: true },
          { id: "initialBalance", label: "Initial Balance", type: "number", required: true, value: "0" },
          { id: "expiresAt", label: "Expiry Date", type: "date" }
        ]
      });
      if (!values) return true;
      const purchaserName = String(values.purchaserName || "").trim();
      const recipientName = String(values.recipientName || "").trim();
      const initialBalance = Number(values.initialBalance || 0);
      const expiresAt = String(values.expiresAt || "").trim();
      if (!purchaserName || !recipientName || !Number.isFinite(initialBalance) || initialBalance <= 0) return true;
      try {
        setCommercialStatus?.("Issuing gift card...");
        await issueGiftCard?.({ purchaserName, recipientName, initialBalance, expiresAt });
        setCommercialStatus?.("Gift card issued.");
        showManageToast?.("Gift card issued.");
      } catch (error) {
        setCommercialStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.id === "manageAddMerchProduct") {
      focusModuleByKey?.("merch");
      if (merchNameInput instanceof HTMLElement) merchNameInput.focus();
      setMerchStatus?.("Add product details, attach an image, then save the item.");
      return true;
    }

    if (target.classList.contains("commercial-edit-membership")) {
      const membershipId = String(target.getAttribute("data-membership-id") || "").trim();
      if (!membershipId) return true;
      const memberships = Array.isArray(getCommercialPayload?.()?.memberships) ? getCommercialPayload().memberships : [];
      const membership = memberships.find((row) => String(row?.id || "") === membershipId);
      if (!membership) return true;
      const values = await openManageForm?.({
        title: "Edit Membership",
        submitLabel: "Save",
        fields: [
          { id: "name", label: "Membership Name", required: true, value: membership.name || "" },
          { id: "price", label: "Price", type: "number", required: true, value: String(membership.price || 0) },
          { id: "billingCycle", label: "Billing Cycle", value: membership.billingCycle || "monthly" },
          { id: "benefits", label: "Benefits", value: membership.benefits || "" }
        ]
      });
      if (!values) return true;
      const name = String(values.name || "").trim();
      const price = Number(values.price || 0);
      const billingCycle = String(values.billingCycle || "monthly").trim();
      const benefits = String(values.benefits || "").trim();
      try {
        setCommercialStatus?.("Updating membership...");
        await upsertMembership?.({ id: membershipId, name, price, billingCycle, benefits, status: membership.status || "active" });
        setCommercialStatus?.("Membership updated.");
        showManageToast?.("Membership updated.");
      } catch (error) {
        setCommercialStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("commercial-delete-membership")) {
      const confirmed = await openManageConfirm?.({
        title: "Delete Membership",
        message: "Set this membership to inactive?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return true;
      const membershipId = String(target.getAttribute("data-membership-id") || "").trim();
      if (!membershipId) return true;
      const memberships = Array.isArray(getCommercialPayload?.()?.memberships) ? getCommercialPayload().memberships : [];
      const membership = memberships.find((row) => String(row?.id || "") === membershipId);
      if (!membership) return true;
      try {
        setCommercialStatus?.("Deactivating membership...");
        await upsertMembership?.({
          id: membershipId,
          name: membership.name,
          price: Number(membership.price || 0),
          billingCycle: membership.billingCycle || "monthly",
          benefits: membership.benefits || "",
          status: "inactive"
        });
        setCommercialStatus?.("Membership deactivated.");
        showManageToast?.("Membership deleted.");
      } catch (error) {
        setCommercialStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("commercial-edit-package")) {
      const packageId = String(target.getAttribute("data-package-id") || "").trim();
      if (!packageId) return true;
      const packages = Array.isArray(getCommercialPayload?.()?.packages) ? getCommercialPayload().packages : [];
      const packageRow = packages.find((row) => String(row?.id || "") === packageId);
      if (!packageRow) return true;
      const values = await openManageForm?.({
        title: "Edit Package",
        submitLabel: "Save",
        fields: [
          { id: "name", label: "Package Name", required: true, value: packageRow.name || "" },
          { id: "price", label: "Price", type: "number", required: true, value: String(packageRow.price || 0) },
          { id: "sessionCount", label: "Session Count", type: "number", required: true, value: String(packageRow.sessionCount || 1) }
        ]
      });
      if (!values) return true;
      const name = String(values.name || "").trim();
      const price = Number(values.price || 0);
      const sessionCount = Number(values.sessionCount || 1);
      try {
        setCommercialStatus?.("Updating package...");
        await upsertPackage?.({ id: packageId, name, price, sessionCount, status: packageRow.status || "active" });
        setCommercialStatus?.("Package updated.");
        showManageToast?.("Package updated.");
      } catch (error) {
        setCommercialStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("commercial-delete-package")) {
      const confirmed = await openManageConfirm?.({
        title: "Delete Package",
        message: "Set this package to inactive?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return true;
      const packageId = String(target.getAttribute("data-package-id") || "").trim();
      if (!packageId) return true;
      const packages = Array.isArray(getCommercialPayload?.()?.packages) ? getCommercialPayload().packages : [];
      const packageRow = packages.find((row) => String(row?.id || "") === packageId);
      if (!packageRow) return true;
      try {
        setCommercialStatus?.("Deactivating package...");
        await upsertPackage?.({
          id: packageId,
          name: packageRow.name,
          price: Number(packageRow.price || 0),
          sessionCount: Number(packageRow.sessionCount || 1),
          status: "inactive"
        });
        setCommercialStatus?.("Package deactivated.");
        showManageToast?.("Package deleted.");
      } catch (error) {
        setCommercialStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("merch-edit")) {
      const merchId = String(target.getAttribute("data-merch-id") || "").trim();
      const merchItems = Array.isArray(getCommercialPayload?.()?.merch) ? getCommercialPayload().merch : [];
      const item = merchItems.find((row) => String(row?.id || "") === merchId);
      if (!item) return true;
      const values = await openManageForm?.({
        title: "Edit Product",
        submitLabel: "Save Product",
        fields: [
          { id: "name", label: "Product Name", required: true, value: item.name || "" },
          { id: "salePrice", label: "Sale Price", type: "number", required: true, value: String(item.salePrice || 0) },
          { id: "inventory", label: "Inventory", type: "number", required: true, value: String(item.inventory || 0) },
          { id: "imageUrl", label: "Image URL or data URL", value: item.imageUrl || "" },
          { id: "description", label: "Description", type: "textarea", required: true, value: item.description || "", rows: 4 },
          {
            id: "shippingAvailable",
            label: "Shipping",
            type: "select",
            value: item.shippingAvailable ? "true" : "false",
            options: [
              { value: "true", label: "Shipping available" },
              { value: "false", label: "Collection only" }
            ]
          },
          { id: "shippingCost", label: "Shipping Cost", type: "number", value: String(item.shippingCost || 0) }
        ]
      });
      if (!values) return true;
      try {
        setMerchStatus?.("Updating product...");
        await upsertMerchItem?.({
          id: merchId,
          name: values.name,
          salePrice: Number(values.salePrice || 0),
          inventory: Math.floor(Number(values.inventory || 0)),
          imageUrl: values.imageUrl,
          description: values.description,
          shippingAvailable: values.shippingAvailable,
          shippingCost: Number(values.shippingCost || 0),
          status: item.status || "active"
        });
        setMerchStatus?.("Product updated.");
        showManageToast?.("Product updated.");
      } catch (error) {
        setMerchStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("merch-delete")) {
      const merchId = String(target.getAttribute("data-merch-id") || "").trim();
      const merchItems = Array.isArray(getCommercialPayload?.()?.merch) ? getCommercialPayload().merch : [];
      const item = merchItems.find((row) => String(row?.id || "") === merchId);
      if (!item) return true;
      const confirmed = await openManageConfirm?.({
        title: "Delete Product",
        message: "Remove this product from the active merch catalog?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return true;
      try {
        setMerchStatus?.("Removing product...");
        await upsertMerchItem?.({
          ...item,
          status: "inactive"
        });
        setMerchStatus?.("Product deleted.");
        showManageToast?.("Product deleted.");
      } catch (error) {
        setMerchStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("merch-ship")) {
      const merchId = String(target.getAttribute("data-merch-id") || "").trim();
      const merchItems = Array.isArray(getCommercialPayload?.()?.merch) ? getCommercialPayload().merch : [];
      const item = merchItems.find((row) => String(row?.id || "") === merchId);
      if (!item) return true;
      const values = await openManageForm?.({
        title: "Ship Product",
        submitLabel: "Create Shipment",
        fields: [
          { id: "customerName", label: "Customer Name", required: true },
          { id: "customerEmail", label: "Customer Email", type: "email" },
          { id: "shippingAddress", label: "Shipping Address", type: "textarea", required: true, rows: 3 },
          { id: "shippingCity", label: "City" },
          { id: "shippingPostcode", label: "Postcode / ZIP" },
          { id: "shippingCountry", label: "Country" },
          { id: "shippingFee", label: "Shipping Fee", type: "number", value: String(item.shippingCost || 0) },
          { id: "trackingRef", label: "Tracking Reference" },
          {
            id: "status",
            label: "Shipment Status",
            type: "select",
            value: "preparing",
            options: [
              { value: "preparing", label: "Preparing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" }
            ]
          }
        ]
      });
      if (!values) return true;
      try {
        setMerchStatus?.("Creating shipment...");
        await createMerchShipment?.(merchId, {
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          shippingAddress: values.shippingAddress,
          shippingCity: values.shippingCity,
          shippingPostcode: values.shippingPostcode,
          shippingCountry: values.shippingCountry,
          shippingFee: Number(values.shippingFee || 0),
          trackingRef: values.trackingRef,
          status: values.status || "preparing"
        });
        setMerchStatus?.("Shipment created.");
        showManageToast?.("Shipment created.");
      } catch (error) {
        setMerchStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    return false;
  }

  return {
    handleManageCommercialClick
  };
}
