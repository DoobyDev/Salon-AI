export function createBookingCapacityService({
  prisma,
  staffRosterService,
  dayKeyFromDate
}) {
  async function getSlotCapacityForBusinessDate(businessId, date) {
    if (!businessId || !date) return 1;
    const businessRecord = await staffRosterService.loadStaffBusinessRecord(businessId);
    const members = staffRosterService.normalizeStaffMembers(businessRecord?.members || []);
    if (!members.length) return 1;
    const dateObj = new Date(`${date}T12:00:00`);
    const dayKey = Number.isNaN(dateObj.getTime()) ? null : dayKeyFromDate(dateObj);
    const active = members.filter((member) => {
      if (member.availability !== "on_duty") return false;
      if (!dayKey) return true;
      if (!Array.isArray(member.shiftDays) || member.shiftDays.length === 0) return true;
      return member.shiftDays.includes(dayKey);
    });
    return Math.max(1, active.length);
  }

  async function isSlotAtCapacity({ businessId, date, time, capacity, excludeBookingId = "" }) {
    const maxCapacity = Math.max(1, Number(capacity || 1));
    const where = {
      businessId,
      date,
      time,
      status: "confirmed",
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {})
    };
    if (maxCapacity <= 1) {
      const found = await prisma.booking.findFirst({ where });
      return Boolean(found);
    }
    const rows = await prisma.booking.findMany({
      where,
      take: maxCapacity,
      select: { id: true }
    });
    return rows.length >= maxCapacity;
  }

  return {
    getSlotCapacityForBusinessDate,
    isSlotAtCapacity
  };
}
