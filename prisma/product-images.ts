import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { createClient } from "@supabase/supabase-js"
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
)

const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
    }),
})

const BUCKET = 'product-images'

const IMAGE_MAP = [
    { productName: 'Elegant Evening Dress', files: ['elegant-evening-dress-1.jpg', 'elegant-evening-dress-2.jpg', 'elegant-evening-dress-3.jpg', 'elegant-evening-dress-4.jpg', 'elegant-evening-dress-5.jpg'] },
    { productName: 'Floral Wrap Dress', files: ['floral-wrap-dress-1.webp', 'floral-wrap-dress-2.jpg', 'floral-wrap-dress-3.jpg', 'floral-wrap-dress-4.jpg', 'floral-wrap-dress-5.jpg'] },
    { productName: 'Silk Blouse', files: ['silk-blouse-1.jpg', 'silk-blouse-2.jpg', 'silk-blouse-3.jpg', 'silk-blouse-4.jpg', 'silk-blouse-5.jpg'] },
    { productName: 'Ruffled Chiffon Blouse', files: ['ruffled-chiffon-blouse-1.jpg', 'ruffled-chiffon-blouse-2.jpg', 'ruffled-chiffon-blouse-3.jpg', 'ruffled-chiffon-blouse-4.jpg', 'ruffled-chiffon-blouse-5.jpg'] },
    { productName: 'Wide-Leg Palazzo Pants', files: ['wide-leg-palazzo-pants-1.jpg', 'wide-leg-palazzo-pants-2.jpg', 'wide-leg-palazzo-pants-3.jpg', 'wide-leg-palazzo-pants-4.jpg', 'wide-leg-palazzo-pants-5.jpg'] },
    { productName: 'Tailored Suit Pants', files: ['tailored-suit-pants-1.jpg', 'tailored-suit-pants-2.jpg', 'tailored-suit-pants-3.jpg', 'tailored-suit-pants-4.jpg', 'tailored-suit-pants-5.jpg'] },
    { productName: 'Structured Blazer', files: ['structured-blazer-1.jpg', 'structured-blazer-2.jpg', 'structured-blazer-3.jpg', 'structured-blazer-4.jpg', 'structured-blazer-5.jpg'] },
    { productName: 'Embroidered Kebaya', files: ['embroidered-kebaya-1.jpg', 'embroidered-kebaya-2.jpg', 'embroidered-kebaya-3.jpg', 'embroidered-kebaya-4.jpg', 'embroidered-kebaya-5.jpg'] },
    { productName: 'Batik Wrap Skirt Set', files: ['batik-wrap-skirt-set-1.jpg', 'batik-wrap-skirt-set-2.jpg', 'batik-wrap-skirt-set-3.jpg', 'batik-wrap-skirt-set-4.jpg', 'batik-wrap-skirt-set-5.jpg'] },
    { productName: 'Trench Coat', files: ['trench-coat-1.jpg', 'trench-coat-2.jpg', 'trench-coat-3.jpg', 'trench-coat-4.jpg', 'trench-coat-5.jpg'] },
]

async function ensureBucket() {
    const { data: buckets } = await supabase.storage.listBuckets()
    const exists = buckets?.some(b => b.name === BUCKET)
    if(!exists) {
        await supabase.storage.createBucket(BUCKET, {public: true })
        console.log("Bucket created:", BUCKET)
    }
    else {
        console.log("Bucket already exists:", BUCKET)
    }
}

async function uploadAndUpdate(productName: string, files: string[]) {
    const uploadedUrls: string[] = []

    for (const filename of files) {
        const filePath = path.join(__dirname, "../images", filename)

        if(!fs.existsSync(filePath)) {
            console.warn(`⚠️ File not found, skipped: ${filename}`)
            continue
        }

        const fileBuffer = fs.readFileSync(filePath)
        const storagePath = `products/${filename}`

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, fileBuffer, {
                contentType: 'image/jpeg',
                upsert: true,
            })

        if (error) {
            console.error(`❌ Upload failed: ${filename}`, error.message)
            continue
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
        uploadedUrls.push(data.publicUrl)
        console.log(`✅ Uploaded: ${filename}`)
    }

    if (uploadedUrls.length > 0) {
        const product = await prisma.product.findFirst({
            where: { name: productName },
        })

        if(!product) {
            console.warn(`⚠️ Product not found in DB: ${productName}`)
            return
        }

        await prisma.product.update({
            where: { id: product.id },
            data: { images: uploadedUrls },
        })

        console.log(`📦 Updated DB: ${productName}\n`)
    }
}

async function main() {
    await ensureBucket()
    for (const item of IMAGE_MAP) {
        await uploadAndUpdate(item.productName, item.files)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())