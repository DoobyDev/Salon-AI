// Document-level manage-action dispatcher for extracted dashboard runtimes.
export function createManageDispatcherRuntime(deps) {
  const {
    getManageModeEnabled,
    isDashboardManagerRole,
    doc = document,
    manageHandlers = []
  } = deps || {};

  function bindManageDispatcher() {
    doc.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!isDashboardManagerRole?.() || !getManageModeEnabled?.()) return;

      for (const handler of manageHandlers) {
        if (typeof handler !== "function") continue;
        if (await handler(target)) return;
      }
    });
  }

  return {
    bindManageDispatcher
  };
}
