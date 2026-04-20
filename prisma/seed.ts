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

  // ===== SEED PRODUCT =====
  console.log('Seeding products...')
  await prisma.product.deleteMany()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())