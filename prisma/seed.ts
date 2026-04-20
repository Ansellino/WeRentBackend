import * as bcrypt from "bcryptjs"
import { PrismaClient, Role, FitType, OrderStatus } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
})

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

// Reviews data: productIndex (0-based), reviewerIndex (0-based), review details
const REVIEWS_DATA = [
  // Elegant Evening Dress — 3 reviews
  {
    productIndex: 0,
    reviewerIndex: 1,
    rating: 5,
    comment: "Dress ini luar biasa! Kualitas bahannya sangat bagus dan potongannya sempurna.",
    fit: FitType.true,
    bust: 86, waist: 68, hips: 90,
  },
  {
    productIndex: 0,
    reviewerIndex: 2,
    rating: 4,
    comment: "Sangat elegan, cocok banget untuk acara formal. Sedikit ketat di bagian pinggang.",
    fit: FitType.small,
    bust: 88, waist: 72, hips: 92,
  },
  {
    productIndex: 0,
    reviewerIndex: 3,
    rating: 5,
    comment: "Cantik sekali! Banyak yang compliment waktu pakai dress ini di gala dinner.",
    fit: FitType.true,
    bust: 84, waist: 66, hips: 88,
  },

  // Floral Wrap Dress — 2 reviews
  {
    productIndex: 1,
    reviewerIndex: 1,
    rating: 4,
    comment: "Motif bunganya lucu dan warnanya cerah. Nyaman dipakai seharian.",
    fit: FitType.true,
    bust: 85, waist: 69, hips: 89,
  },
  {
    productIndex: 1,
    reviewerIndex: 2,
    rating: 3,
    comment: "Lucu tapi bahannya agak tipis. Overall masih oke untuk acara santai.",
    fit: FitType.large,
    bust: 82, waist: 65, hips: 87,
  },

  // Silk Blouse — 1 review
  {
    productIndex: 2,
    reviewerIndex: 3,
    rating: 5,
    comment: "Bahannya silk beneran, adem dan jatuhnya bagus. Recommended banget!",
    fit: FitType.true,
    bust: 83, waist: 67, hips: 88,
  },

  // Structured Blazer — 2 reviews
  {
    productIndex: 6,
    reviewerIndex: 1,
    rating: 4,
    comment: "Blazernya rapi dan profesional. Cocok untuk meeting dan presentasi.",
    fit: FitType.true,
    bust: 87, waist: 71, hips: 91,
  },
  {
    productIndex: 6,
    reviewerIndex: 2,
    rating: 5,
    comment: "Kualitas bahan premium, potongan yang sangat flattering. Worth it!",
    fit: FitType.small,
    bust: 90, waist: 74, hips: 94,
  },

  // Embroidered Kebaya — 3 reviews
  {
    productIndex: 7,
    reviewerIndex: 1,
    rating: 5,
    comment: "Kebayanya indah banget, sulamannya halus dan detail. Pas dipakai ke pernikahan.",
    fit: FitType.true,
    bust: 84, waist: 68, hips: 89,
  },
  {
    productIndex: 7,
    reviewerIndex: 2,
    rating: 5,
    comment: "Sangat cantik dan berkelas. Semua tamu di wedding compliment terus.",
    fit: FitType.true,
    bust: 86, waist: 70, hips: 90,
  },
  {
    productIndex: 7,
    reviewerIndex: 3,
    rating: 4,
    comment: "Kualitas sulaman sangat bagus. Sedikit ketat di bagian dada tapi masih nyaman.",
    fit: FitType.small,
    bust: 89, waist: 73, hips: 93,
  },

  // Trench Coat — 1 review
  {
    productIndex: 9,
    reviewerIndex: 3,
    rating: 4,
    comment: "Coat klasik yang timeless. Bahannya tebal dan berkualitas.",
    fit: FitType.true,
    bust: 85, waist: 69, hips: 90,
  },
]

async function main() {
  console.log('Cleaning up old data...')
  await prisma.reviewHelpful.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // ===== SEED USERS =====
  console.log('Seeding users...')
  const password = await bcrypt.hash("password123", 12)

  const users = await Promise.all([
    prisma.user.create({
      data: { name: "User", email: "user@mail.com", password, role: Role.USER },
    }),
    prisma.user.create({
      data: { name: "Rina Kusuma", email: "rina@mail.com", password, role: Role.USER },
    }),
    prisma.user.create({
      data: { name: "Sari Dewi", email: "sari@mail.com", password, role: Role.USER },
    }),
    prisma.user.create({
      data: { name: "Mia Putri", email: "mia@mail.com", password, role: Role.USER },
    }),
  ])

  // ===== SEED PRODUCTS =====
  console.log('Seeding products...')
  const products = await Promise.all(
    PRODUCTS.map((product) =>
      prisma.product.create({
        data: {
          ...product,
          images: [
            `https://placehold.co/400x600?text=${encodeURIComponent(product.name)}`,
            `https://placehold.co/400x600?text=${encodeURIComponent(product.name)}+2`,
          ],
        },
      })
    )
  )

  // ===== SEED COMPLETED ORDERS (required for review eligibility) =====
  console.log('Seeding orders...')

  // For each reviewer (users[1], users[2], users[3]), create completed orders
  // for the products they will review
  const reviewerProductMap: Record<number, number[]> = {
    1: [0, 1, 6, 7],   // Rina reviews products at index 0,1,6,7
    2: [0, 1, 6, 7],   // Sari reviews products at index 0,1,6,7
    3: [0, 2, 7, 9],   // Mia reviews products at index 0,2,7,9
  }

  for (const [reviewerIdx, productIdxList] of Object.entries(reviewerProductMap)) {
    const user = users[Number(reviewerIdx)]
    for (const productIdx of productIdxList) {
      const product = products[productIdx]
      await prisma.order.create({
        data: {
          userId: user.id,
          status: OrderStatus.COMPLETED,
          shippingAddress: "Jl. Contoh No. 1, Jakarta",
          courierLabel: "JNE Regular (2-3 days)",
          courierService: "REG",
          shippingCost: 18000,
          total: product.pricePerDay * 3 + 18000,
          items: {
            create: {
              productId: product.id,
              productName: product.name,
              size: product.sizes[0],
              quantity: 1,
              startDate: new Date('2026-01-10'),
              rentalDays: 3,
              endDate: new Date('2026-01-13'),
              subtotal: product.pricePerDay * 3,
            },
          },
        },
      })
    }
  }

  // ===== SEED REVIEWS =====
  console.log('Seeding reviews...')
  for (const r of REVIEWS_DATA) {
    const user = users[r.reviewerIndex]
    const product = products[r.productIndex]
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        rating: r.rating,
        comment: r.comment,
        fit: r.fit,
        bustCm: r.bust,
        waistCm: r.waist,
        hipsCm: r.hips,
        mediaUrls: [],
        helpfulCount: 0,
      },
    })
  }

  console.log("✅ Seed success")
  console.log(`   ${users.length} users`)
  console.log(`   ${products.length} products`)
  console.log(`   ${REVIEWS_DATA.length} reviews`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())