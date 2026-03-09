export const frontDeskMock = {
  logo: "/icons/barber.svg",
  name: "Glow Studio Salon",
  rating: "4.5/5",
  description: "Premium color and styling studio in central London.",
  social: [
    { label: "Facebook", url: "https://facebook.com/glowstudio", icon: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#4267B2' d='M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5.02 3.68 9.16 8.44 9.88v-6.99h-2.54v-2.89h2.54V9.89c0-2.5 1.49-3.89 3.77-3.89c1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.32 21.16 22 17.02 22 12z'/></svg>" },
    { label: "Instagram", url: "https://instagram.com/glowstudio", icon: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#E1306C' d='M12 2.2c3.2 0 3.584.012 4.85.07c1.17.056 1.97.24 2.43.41c.59.21 1.01.46 1.46.91c.45.45.7.87.91 1.46c.17.46.35 1.26.41 2.43c.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43c-.21.59-.46 1.01-.91 1.46c-.45.45-.87.7-1.46.91c-.46.17-1.26.35-2.43.41c-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41c-.59-.21-1.01-.46-1.46-.91c-.45-.45-.7-.87-.91-1.46c-.17-.46-.35-1.26-.41-2.43c-.058-1.266-.07-1.65-.07-4.85s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43c.21-.59.46-1.01.91-1.46c.45-.45.87-.7 1.46-.91c.46-.17 1.26-.35 2.43-.41c1.266-.058 1.65-.07 4.85-.07zm0-2.2C8.74 0 8.332.012 7.05.07c-1.28.058-2.16.24-2.91.41c-.75.17-1.36.46-1.91.91c-.55.45-.94.87-1.39 1.46c-.45.59-.74 1.2-.91 1.91c-.17.75-.35 1.63-.41 2.91C.012 8.332 0 8.74 0 12c0 3.26.012 3.668.07 4.95c.058 1.28.24 2.16.41 2.91c.17.75.46 1.36.91 1.91c.45.55.87.94 1.46 1.39c.59.45 1.2.74 1.91.91c.75.17 1.63.35 2.91.41c1.282.058 1.69.07 4.95.07c3.26 0 3.668-.012 4.95-.07c1.28-.058 2.16-.24 2.91-.41c.75-.17 1.36-.46 1.91-.91c.55-.45.94-.87 1.39-1.46c.45-.59.74-1.2.91-1.91c.17-.75.35-1.63.41-2.91c.058-1.282.07-1.69.07-4.95c0-3.26-.012-3.668-.07-4.95c-.058-1.28-.24-2.16-.41-2.91c-.17-.75-.46-1.36-.91-1.91c-.45-.55-.87-.94-1.46-1.39c-.59-.45-1.2-.74-1.91-.91c-.75-.17-1.63-.35-2.91-.41C15.668.012 15.26 0 12 0z'/></svg>" }
  ],
  services: [
    { name: "Balayage", price: "Â£230", duration: "180min", image: "/icons/balayage.svg" },
    { name: "Blowout", price: "Â£50", duration: "45min", image: "/icons/blowout.svg" },
    { name: "Women's Haircut", price: "Â£85", duration: "60min", image: "/icons/haircut.svg" }
  ],
  reviews: [
    { text: "Amazing color and service!", rating: "5/5", author: "Ava T." },
    { text: "Best beauty business in London.", rating: "4/5", author: "Daniel R." }
  ],
  analytics: [
    { label: "Bookings", value: "128" },
    { label: "Revenue", value: "Â£14,920" },
    { label: "No-Show Rate", value: "3.6%" },
    { label: "Repeat Client Rate", value: "62%" }
  ],
  aiChat: "Hi, I'm Lexi. How can I help today?"
};

export const customerSalonDirectory = [
  {
    id: "salon-urban-fade",
    name: "Urban Fade Studio",
    businessType: "barbershop",
    city: "Downtown",
    rating: 4.8,
    services: ["fade", "beard trim", "line up"],
    barbers: ["Marcus", "Jay", "Ivy"],
    specialists: ["Marcus", "Jay", "Ivy"],
    phone: "(555) 210-9901",
    email: "hello@urbanfade.example",
    address: "125 Main St, Downtown",
    availableSlots: ["2026-02-24 10:00", "2026-02-24 14:30", "2026-02-25 09:15"]
  },
  {
    id: "salon-luxe-color",
    name: "Luxe Color Loft",
    businessType: "hair_salon",
    city: "Midtown",
    rating: 4.7,
    services: ["balayage", "highlights", "blowout"],
    barbers: ["Amara", "Nina"],
    specialists: ["Amara", "Nina"],
    phone: "(555) 210-4410",
    email: "book@luxecolor.example",
    address: "42 Elm Ave, Midtown",
    availableSlots: ["2026-02-23 11:30", "2026-02-24 16:00", "2026-02-26 13:45"]
  },
  {
    id: "salon-classic-chair",
    name: "Classic Chair Barbers",
    businessType: "barbershop",
    city: "Uptown",
    rating: 4.4,
    services: ["skin fade", "buzz cut", "hot towel shave"],
    barbers: ["Devin", "Luis"],
    specialists: ["Devin", "Luis"],
    phone: "(555) 210-7788",
    email: "team@classicchair.example",
    address: "88 Pine Rd, Uptown",
    availableSlots: ["2026-02-22 15:00", "2026-02-23 09:45", "2026-02-25 12:30"]
  },
  {
    id: "salon-willow-style",
    name: "Willow Style House",
    businessType: "beauty_salon",
    city: "West End",
    rating: 4.6,
    services: ["brow shaping", "lash lift", "keratin treatment"],
    barbers: ["Tara", "Mila"],
    specialists: ["Tara", "Mila"],
    phone: "(555) 210-1266",
    email: "care@willowstyle.example",
    address: "9 Willow Ln, West End",
    availableSlots: ["2026-02-24 08:45", "2026-02-24 17:15", "2026-02-27 11:00"]
  }
];
