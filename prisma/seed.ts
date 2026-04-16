import bcrypt from "bcryptjs"
import { PrismaClient, Role } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
})

async function main() {
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())