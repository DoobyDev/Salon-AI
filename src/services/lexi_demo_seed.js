export function createLexiDemoSeedService({
  getPrisma,
  normalizeBusinessType,
  defaultDescriptionByBusinessType,
  defaultHoursByBusinessType,
  defaultServicesByBusinessType,
  nextDateForWeekday,
  clearReadCache,
  forceSeedEnv = ""
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function buildLexiDemoSeedBusinesses() {
    return [
      {
        name: "North Lane Studio",
        type: "hair_salon",
        city: "Chester",
        country: "UK",
        postcode: "CH1 2AB",
        address: "12 North Lane, Chester",
        phone: "+44 1244 100201",
        email: "hello@northlanestudio.demo",
        websiteUrl: "https://northlanestudio.demo",
        rating: 4.9
      },
      {
        name: "Dockside Fade Co",
        type: "barbershop",
        city: "Liverpool",
        country: "UK",
        postcode: "L1 4DX",
        address: "88 Dockside Street, Liverpool",
        phone: "+44 151 200 3401",
        email: "bookings@docksidefade.demo",
        websiteUrl: "https://docksidefade.demo",
        rating: 4.8
      },
      {
        name: "Willow Beauty Rooms",
        type: "beauty_salon",
        city: "Manchester",
        country: "UK",
        postcode: "M2 5PL",
        address: "24 Willow Arcade, Manchester",
        phone: "+44 161 555 0192",
        email: "hello@willowbeauty.demo",
        websiteUrl: "https://willowbeauty.demo",
        rating: 4.7
      },
      {
        name: "Crown & Curl Collective",
        type: "hair_salon",
        city: "Leeds",
        country: "UK",
        postcode: "LS1 6TR",
        address: "6 Crown Court, Leeds",
        phone: "+44 113 700 4821",
        email: "team@crownandcurl.demo",
        websiteUrl: "https://crownandcurl.demo",
        rating: 4.9
      },
      {
        name: "Harbour Glow Beauty",
        type: "beauty_salon",
        city: "Bristol",
        country: "UK",
        postcode: "BS1 5AA",
        address: "31 Harbour View, Bristol",
        phone: "+44 117 330 8810",
        email: "appointments@harbourglow.demo",
        websiteUrl: "https://harbourglow.demo",
        rating: 4.8
      }
    ];
  }

  function buildLexiDemoSeedBookings({ business, services }) {
    const safeServices = Array.isArray(services) ? services : [];
    if (!business?.id || !safeServices.length) return [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monday = nextDateForWeekday(1, new Date());
    const friday = nextDateForWeekday(5, new Date());
    const dates = [tomorrow, monday, friday].map((d) => d.toISOString().slice(0, 10));
    const customerNames = ["Ava Reed", "Daniel Moss", "Chloe Hart", "Sam Turner", "Mia Blake"];
    return dates.map((dateKey, index) => {
      const service = safeServices[index % safeServices.length];
      return {
        businessId: business.id,
        businessName: business.name,
        customerName: customerNames[index % customerNames.length],
        customerPhone: `+44 7000 000${index + 1}${String(business.name.length % 9)}`,
        customerEmail: `demo${index + 1}.${business.id.slice(-4)}@example.test`,
        service: String(service.name || "Appointment"),
        price: Number(service.price || 0),
        date: dateKey,
        time: index === 0 ? "10:00" : index === 1 ? "13:00" : "16:00",
        status: "confirmed",
        source: "manual",
        notes: "Demo seed booking"
      };
    });
  }

  async function ensureLexiDemoSubscribedBusinesses() {
    const prisma = prismaClient();
    const forceSeed = String(forceSeedEnv || "").trim().toLowerCase() === "true";
    const activeCount = await prisma.subscription.count({
      where: { status: { in: ["active", "trialing", "trial", "past_due"] } }
    });
    const searchableSubscribedCount = await prisma.business.count({
      where: {
        subscription: {
          is: { status: { in: ["active", "trialing", "trial", "past_due"] } }
        }
      }
    });
    if (searchableSubscribedCount >= 3 && !forceSeed) {
      console.log(`Lexi demo seed skipped (found ${searchableSubscribedCount} subscribed businesses, ${activeCount} active/trial subscriptions).`);
      return;
    }

    const slhRows = await prisma.business.findMany({
      where: { name: { contains: "slh cuts", mode: "insensitive" } },
      select: { id: true }
    });
    const deletedSlh = slhRows.length
      ? await prisma.business.deleteMany({
          where: { id: { in: slhRows.map((row) => row.id) } }
        })
      : { count: 0 };

    const seedBusinesses = buildLexiDemoSeedBusinesses();
    for (const row of seedBusinesses) {
      const existing = await prisma.business.findFirst({
        where: { name: { contains: row.name, mode: "insensitive" } },
        include: { services: true }
      });
      const businessType = normalizeBusinessType(row.type);
      const business = existing
        ? await prisma.business.update({
            where: { id: existing.id },
            data: {
              type: businessType,
              phone: row.phone,
              email: row.email,
              city: row.city,
              country: row.country,
              postcode: row.postcode,
              address: row.address,
              rating: row.rating,
              description: defaultDescriptionByBusinessType(businessType, row.name),
              websiteUrl: row.websiteUrl,
              websiteTitle: row.name,
              websiteSummary: `${row.name} accepts bookings through Lexi AI Receptionist.`,
              hoursJson: JSON.stringify(defaultHoursByBusinessType(businessType))
            }
          })
        : await prisma.business.create({
            data: {
              name: row.name,
              type: businessType,
              phone: row.phone,
              email: row.email,
              city: row.city,
              country: row.country,
              postcode: row.postcode,
              address: row.address,
              rating: row.rating,
              description: defaultDescriptionByBusinessType(businessType, row.name),
              websiteUrl: row.websiteUrl,
              websiteTitle: row.name,
              websiteSummary: `${row.name} accepts bookings through Lexi AI Receptionist.`,
              hoursJson: JSON.stringify(defaultHoursByBusinessType(businessType))
            }
          });

      const servicesSeed = defaultServicesByBusinessType(businessType);
      await prisma.service.deleteMany({ where: { businessId: business.id } });
      if (servicesSeed.length) {
        await prisma.service.createMany({
          data: servicesSeed.map((serviceRow) => ({
            businessId: business.id,
            name: serviceRow.name,
            durationMin: Number(serviceRow.durationMin || 45),
            price: Number(serviceRow.price || 0)
          }))
        });
      }

      await prisma.subscription.upsert({
        where: { businessId: business.id },
        update: {
          status: "active",
          plan: "pro",
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        },
        create: {
          businessId: business.id,
          status: "active",
          plan: "pro",
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        }
      });

      const bookingCount = await prisma.booking.count({ where: { businessId: business.id } });
      if (bookingCount === 0) {
        const refreshedServices = await prisma.service.findMany({
          where: { businessId: business.id },
          orderBy: [{ createdAt: "asc" }, { name: "asc" }]
        });
        const demoBookings = buildLexiDemoSeedBookings({ business, services: refreshedServices });
        if (demoBookings.length) {
          await prisma.booking.createMany({ data: demoBookings });
        }
      }
    }
    clearReadCache();
    console.log(
      `Lexi demo subscriber seed ready (${seedBusinesses.length} businesses${deletedSlh.count ? `, removed ${deletedSlh.count} SLH Cuts record(s)` : ""}; previous active/trial subscriptions: ${activeCount}, searchable subscribed businesses: ${searchableSubscribedCount}).`
    );
  }

  return {
    ensureLexiDemoSubscribedBusinesses
  };
}
