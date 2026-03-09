// Managed CRM actions extracted from the global dashboard click handler.
export function createManageCrmActionsRuntime(deps) {
  const {
    openManageForm,
    openManageConfirm,
    showManageToast,
    getCrmSegmentsPayload,
    setCrmSegmentsPayload,
    setCrmStatus,
    renderCrmSegments,
    sendCrmCampaign
  } = deps || {};

  async function handleManageCrmClick(target) {
    if (!(target instanceof HTMLElement)) return false;

    if (target.id === "manageAddCrmCampaign") {
      const values = await openManageForm?.({
        title: "Add CRM Campaign Activity",
        submitLabel: "Save",
        fields: [
          { id: "segmentId", label: "Segment ID", required: true, value: "high_value_lapsed" },
          { id: "customerKey", label: "Customer Key", required: true },
          { id: "customerName", label: "Customer Name" },
          { id: "message", label: "Campaign Message", type: "textarea", required: true }
        ]
      });
      if (!values) return true;
      const segmentId = String(values.segmentId || "").trim();
      const customerKey = String(values.customerKey || "").trim();
      const customerName = String(values.customerName || "").trim();
      const message = String(values.message || "").trim();
      if (!segmentId || !customerKey || !message) return true;
      try {
        setCrmStatus?.("Saving campaign activity...");
        await sendCrmCampaign?.({ segmentId, customerKey, customerName, message, channel: "manual" });
        setCrmStatus?.("Campaign activity saved.");
        showManageToast?.("CRM campaign activity added.");
      } catch (error) {
        setCrmStatus?.(error.message, true);
        showManageToast?.(error.message, "error");
      }
      return true;
    }

    if (target.classList.contains("crm-edit-template")) {
      const segmentId = String(target.getAttribute("data-segment-id") || "").trim();
      const currentMessage = String(target.getAttribute("data-message") || "").trim();
      if (!segmentId) return true;
      const values = await openManageForm?.({
        title: "Edit CRM Template",
        submitLabel: "Save",
        fields: [{ id: "message", label: "Template Message", type: "textarea", required: true, value: currentMessage }]
      });
      if (!values) return true;
      const nextMessage = String(values.message || "").trim();
      if (!nextMessage) return true;
      const payload = getCrmSegmentsPayload?.() || {};
      const segments = Array.isArray(payload.segments) ? payload.segments.slice() : [];
      const segmentIndex = segments.findIndex((row) => String(row?.id || "") === segmentId);
      if (segmentIndex < 0) return true;
      const segment = segments[segmentIndex] && typeof segments[segmentIndex] === "object" ? { ...segments[segmentIndex] } : {};
      const leads = Array.isArray(segment.leads) ? segment.leads.slice() : [];
      if (!leads.length) {
        leads.push({ customerKey: "", customerName: "", message: nextMessage });
      } else {
        leads[0] = { ...leads[0], message: nextMessage };
      }
      segment.leads = leads;
      segments[segmentIndex] = segment;
      setCrmSegmentsPayload?.({
        ...payload,
        segments
      });
      renderCrmSegments?.();
      setCrmStatus?.("Template updated in this session.");
      showManageToast?.("CRM template updated.");
      return true;
    }

    if (target.classList.contains("crm-delete-segment")) {
      const confirmed = await openManageConfirm?.({
        title: "Delete CRM Segment",
        message: "Remove this segment from dashboard view?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return true;
      const segmentId = String(target.getAttribute("data-segment-id") || "").trim();
      if (!segmentId) return true;
      const payload = getCrmSegmentsPayload?.() || {};
      const segments = Array.isArray(payload.segments) ? payload.segments : [];
      setCrmSegmentsPayload?.({
        ...payload,
        segments: segments.filter((row) => String(row?.id || "") !== segmentId)
      });
      renderCrmSegments?.();
      setCrmStatus?.("Segment removed from dashboard view.");
      showManageToast?.("CRM segment deleted.");
      return true;
    }

    return false;
  }

  return {
    handleManageCrmClick
  };
}
