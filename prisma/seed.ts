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

  console.log("✅ Seed success")

  // ===== SEED PRODUCT =====
  console.log('Seeding products...')
  await prisma.product.deleteMany()

  for(let i=1; i<=10; i++) {
    await prisma.product.create({
      data: {
        name: `Product ${i} - ${CATEGORIES[i%CATEGORIES.length]}`,
        description: `A beautiful ${CATEGORIES[i%CATEGORIES.length].toLowerCase()} perfect for special occasions.`,
        pricePerDay: [50000, 75000, 100000, 125000, 150000][i%5],
        category: CATEGORIES[i%CATEGORIES.length],
        images:[`https://placehold.co/400x600?text=Product+${i}`],
        sizes: SIZES,
      },
    })
  }

  console.log("Product Seeded!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())