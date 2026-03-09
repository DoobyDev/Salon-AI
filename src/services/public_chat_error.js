export function createPublicChatErrorService({
  shouldLogOpenAiQuotaError,
  markOpenAiQuotaCircuit,
  buildPublicLexiFallbackReplySafe
} = {}) {
  async function handlePublicChatError({ error, business, userMessage, history, memory } = {}) {
    const status = Number(error?.status || error?.code || 0);
    const code = String(error?.error?.code || error?.code || "");
    const message = String(error?.error?.message || error?.message || "");

    if (status === 429 || code === "insufficient_quota") {
      if (shouldLogOpenAiQuotaError()) {
        console.error("Chat error:", status || "", code || "", message || "");
      }
    } else {
      console.error("Chat error:", status || "", code || "", message || "");
    }

    const safePublicFallback = async () => {
      try {
        if (business) {
          return {
            statusCode: 200,
            body: {
              reply: await buildPublicLexiFallbackReplySafe(userMessage, business, history, memory),
              fallback: true
            }
          };
        }
      } catch (fallbackError) {
        console.error("Chat fallback error:", fallbackError?.message || fallbackError);
      }
      return {
        statusCode: 200,
        body: {
          reply: "I can answer questions about the app and how to use it, but I hit a temporary issue just now. Please try again.",
          fallback: true
        }
      };
    };

    if (status === 429 || code === "insufficient_quota") {
      markOpenAiQuotaCircuit(code || "insufficient_quota");
      if (business) {
        return safePublicFallback();
      }
      return {
        statusCode: 429,
        body: {
          error: "OpenAI quota exceeded. Please add billing/credits in your OpenAI project."
        }
      };
    }

    if (status === 401) {
      if (business) {
        return safePublicFallback();
      }
      return {
        statusCode: 401,
        body: {
          error: "OpenAI authentication failed. Check OPENAI_API_KEY in .env."
        }
      };
    }

    if (business) {
      return safePublicFallback();
    }

    return {
      statusCode: 500,
      body: { error: "Failed to process chat request." }
    };
  }

  return {
    handlePublicChatError
  };
}
