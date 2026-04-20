import bcrypt from "bcryptjs"
import { PrismaClient, Role } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
})

const CATEGORIES = ['Dress', 'Blouse', 'Pants', 'Outerwear', 'Traditional']
const SIZES = ['XS', 'S', 'M', 'L', 'XL']

const PRODUCTS = [
  {
    name: "Elegant Evening Dress",
    category: "Dress",
    description: "A stunning evening dress perfect for formal events and galas.",
    pricePerDay: 150000,
    sizes: ['S', 'M', 'L'],
  },
  {
    name: "Floral Wrap Dress",
    category: "Dress",
    description: "A beautiful floral wrap dress ideal for garden parties and brunches.",
    pricePerDay: 100000,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    name: "Silk Blouse",
    category: "Blouse",
    description: "A luxurious silk blouse that pairs perfectly with trousers or skirts.",
    pricePerDay: 75000,
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    name: "Ruffled Chiffon Blouse",
    category: "Blouse",
    description: "A feminine chiffon blouse with elegant ruffle details.",
    pricePerDay: 65000,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: "Wide-Leg Palazzo Pants",
    category: "Pants",
    description: "Sophisticated wide-leg pants suitable for formal and semi-formal occasions.",
    pricePerDay: 80000,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    name: "Tailored Suit Pants",
    category: "Pants",
    description: "Crisp tailored pants for a professional and polished look.",
    pricePerDay: 85000,
    sizes: ['S', 'M', 'L'],
  },
  {
    name: "Structured Blazer",
    category: "Outerwear",
    description: "A sharp structured blazer that elevates any outfit.",
    pricePerDay: 120000,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    name: "Embroidered Kebaya",
    category: "Traditional",
    description: "A beautifully hand-embroidered kebaya for traditional ceremonies and weddings.",
    pricePerDay: 200000,
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    name: "Batik Wrap Skirt Set",
    category: "Traditional",
    description: "An authentic batik wrap skirt set, perfect for cultural events.",
    pricePerDay: 175000,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: "Trench Coat",
    category: "Outerwear",
    description: "A classic trench coat that adds elegance to any ensemble.",
    pricePerDay: 130000,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
]

async function main() {
  // ===== SEED USER =====
  const password = await bcrypt.hash("password123", 12)

  await prisma.user.upsert({
    where: { email: "user@mail.com" },
    update: {},
    create: {
      name: "User",
      email: "user@mail.com",
      password,
      role: Role.USER,
    },
  })

  // ===== SEED PRODUCT =====
  console.log('Seeding products...')
  await prisma.product.deleteMany()

  await prisma.product.createMany({
    data: PRODUCTS.map((product, i) => ({
      ...product,
      images: [
        `https://placehold.co/400x600?text=${encodeURIComponent(product.name)}`,
        `https://placehold.co/400x600?text=${encodeURIComponent(product.name)}+2`,
      ],
    })),
  })

  console.log("✅ Seed success")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())