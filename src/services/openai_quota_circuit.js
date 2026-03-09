export function createOpenAiQuotaCircuitUtils({
  openAiQuotaCircuit,
  cooldownMs,
  logThrottleMs
}) {
  function isOpenAiQuotaCircuitActive() {
    return Date.now() < Number(openAiQuotaCircuit.disabledUntil || 0);
  }

  function markOpenAiQuotaCircuit(reason = "insufficient_quota") {
    openAiQuotaCircuit.disabledUntil = Date.now() + cooldownMs;
    openAiQuotaCircuit.reason = String(reason || "insufficient_quota");
  }

  function clearOpenAiQuotaCircuit() {
    openAiQuotaCircuit.disabledUntil = 0;
    openAiQuotaCircuit.reason = "";
  }

  function shouldLogOpenAiQuotaError() {
    const now = Date.now();
    if (now - Number(openAiQuotaCircuit.lastLogAt || 0) < logThrottleMs) {
      return false;
    }
    openAiQuotaCircuit.lastLogAt = now;
    return true;
  }

  return {
    isOpenAiQuotaCircuitActive,
    markOpenAiQuotaCircuit,
    clearOpenAiQuotaCircuit,
    shouldLogOpenAiQuotaError
  };
}
