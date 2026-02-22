import { Queue, Worker } from "bullmq";

function createNoopRuntime(handlers) {
  return {
    enabled: false,
    async enqueueNotification(payload) {
      await handlers.onNotification(payload);
    },
    async enqueueBillingEvent(payload) {
      await handlers.onBillingEvent(payload);
    },
    async close() {}
  };
}

export function createJobRuntime({ redisUrl, handlers }) {
  if (!redisUrl) return createNoopRuntime(handlers);

  const connection = { url: redisUrl };
  const prefix = String(process.env.BULLMQ_PREFIX || "salonai").trim();
  const notificationQueue = new Queue("notification-jobs", { connection, prefix });
  const billingQueue = new Queue("billing-webhook-jobs", { connection, prefix });

  const notificationWorker = new Worker(
    "notification-jobs",
    async (job) => {
      await handlers.onNotification(job.data);
    },
    { connection, concurrency: Number(process.env.JOBS_NOTIFICATION_CONCURRENCY || 10), prefix }
  );

  const billingWorker = new Worker(
    "billing-webhook-jobs",
    async (job) => {
      await handlers.onBillingEvent(job.data);
    },
    { connection, concurrency: Number(process.env.JOBS_BILLING_CONCURRENCY || 5), prefix }
  );

  notificationWorker.on("failed", (job, error) => {
    console.error("Notification job failed:", job?.id, error?.message || "unknown");
  });
  billingWorker.on("failed", (job, error) => {
    console.error("Billing job failed:", job?.id, error?.message || "unknown");
  });

  return {
    enabled: true,
    async enqueueNotification(payload) {
      await notificationQueue.add("send-booking-notification", payload, {
        attempts: 3,
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 1000 },
        backoff: { type: "exponential", delay: 3000 }
      });
    },
    async enqueueBillingEvent(payload) {
      await billingQueue.add("process-stripe-webhook", payload, {
        attempts: 5,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 2000 },
        backoff: { type: "exponential", delay: 2500 }
      });
    },
    async close() {
      await Promise.all([
        notificationWorker.close(),
        billingWorker.close(),
        notificationQueue.close(),
        billingQueue.close()
      ]);
    }
  };
}
