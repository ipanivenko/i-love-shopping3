// prisma/clean.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning seeded data...");

  // Delete children first
  const delSkus = await prisma.productSku.deleteMany({});
  console.log(`- ProductSku deleted: ${delSkus.count}`);

  const delImages = await prisma.productColorImage.deleteMany({});
  console.log(`- ProductColorImage deleted: ${delImages.count}`);

  const delColors = await prisma.productColor.deleteMany({});
  console.log(`- ProductColor deleted: ${delColors.count}`);

  const delProducts = await prisma.product.deleteMany({});
  console.log(`- Product deleted: ${delProducts.count}`);

  // Optional: if you ONLY seed ASICS right now, you can remove the brand too
  const delBrands = await prisma.brand.deleteMany({
    where: { slug: "asics" },
  });
  console.log(`- Brand(asics) deleted: ${delBrands.count}`);

  // Optional: remove categories created by seed (only if you’re sure you don’t have other products using them)
  const delCats = await prisma.category.deleteMany({
    where: { slug: { in: ["running", "tennis"] } },
  });
  console.log(`- Category(running/tennis) deleted: ${delCats.count}`);

  console.log("✅ Clean complete.");
}

main()
  .catch((e) => {
    console.error("❌ Clean failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
