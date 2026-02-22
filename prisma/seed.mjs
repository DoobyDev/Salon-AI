import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultHours = {
  monday: "09:00-18:00",
  tuesday: "09:00-18:00",
  wednesday: "09:00-18:00",
  thursday: "09:00-20:00",
  friday: "09:00-20:00",
  saturday: "10:00-17:00",
  sunday: "Closed"
};

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@salonai.app").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const business1 = await prisma.business.upsert({
    where: { id: "seed_biz_glow" },
    update: {},
    create: {
      id: "seed_biz_glow",
      name: "Glow Studio Salon",
      type: "salon",
      phone: "+44 20 7946 0720",
      email: "hello@glowstudio.co.uk",
      city: "London",
      country: "United Kingdom",
      postcode: "SW1A 1AA",
      address: "12 Regent St",
      rating: 4.9,
      description: "Premium color and styling studio in central London.",
      websiteUrl: "https://glowstudio.co.uk",
      websiteTitle: "Glow Studio London",
      websiteSummary: "Award-winning color and styling in the heart of London.",
      websiteImageUrl: "https://glowstudio.co.uk/og-image.jpg",
      hoursJson: JSON.stringify(defaultHours)
    }
  });

  const business2 = await prisma.business.upsert({
    where: { id: "seed_biz_mainstreet" },
    update: {},
    create: {
      id: "seed_biz_mainstreet",
      name: "Main Street Barber Co.",
      type: "barber",
      phone: "+1 212-555-0199",
      email: "frontdesk@mainstreetbarber.com",
      city: "New York",
      country: "United States",
      postcode: "10001",
      address: "220 W 30th St",
      rating: 4.8,
      description: "Modern barbershop with walk-in and booked services.",
      websiteUrl: "https://mainstreetbarber.com",
      websiteTitle: "Main Street Barber Co.",
      websiteSummary: "Classic and modern cuts in NYC.",
      websiteImageUrl: "https://mainstreetbarber.com/og-image.jpg",
      hoursJson: JSON.stringify(defaultHours)
    }
  });

  await prisma.service.createMany({
    data: [
      { businessId: business1.id, name: "Balayage", durationMin: 180, price: 230 },
      { businessId: business1.id, name: "Blowout", durationMin: 45, price: 50 },
      { businessId: business1.id, name: "Women's Haircut", durationMin: 60, price: 85 },
      { businessId: business2.id, name: "Men's Haircut", durationMin: 45, price: 55 },
      { businessId: business2.id, name: "Skin Fade", durationMin: 50, price: 65 },
      { businessId: business2.id, name: "Beard Trim", durationMin: 20, price: 30 }
    ],
    skipDuplicates: true
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      role: "admin",
      name: "Platform Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10)
    }
  });

  await prisma.user.upsert({
    where: { email: "owner@glowstudio.co.uk" },
    update: {},
    create: {
      role: "subscriber",
      name: "Demo Owner",
      email: "owner@glowstudio.co.uk",
      passwordHash: await bcrypt.hash("DemoSubscriber123!", 10),
      businessId: business1.id
    }
  });

  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      role: "customer",
      name: "Demo Customer",
      email: "customer@example.com",
      passwordHash: await bcrypt.hash("DemoCustomer123!", 10)
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed complete.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
