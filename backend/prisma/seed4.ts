import "dotenv/config";
import {
  PrismaClient,
  Prisma,
  ProductStatus,
  Gender,
  ShoeSurface,
} from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------- CONFIG ----------

const FOLDERS = [
  "b2c/nike_metcon_10/violet mix",
  "b2c/nike_metcon_10/peony",

  "b2c/nike_structure_plus/tattoo",
  "b2c/nike_structure_plus/bright violet",

  "b2c/Nike_Air_Zoom_Pegasus_41_GORE_TEX/cannon",

  "b2c/Nike Air Winflo 11/mint",
  "b2c/Nike Air Winflo 11/coral",
] as const;

const COLOR_HEX: Record<string, string> = {
  "violet mix": "#7C3AED",
  peony: "#EC4899",
  tattoo: "#111827",
  "bright violet": "#8B5CF6",
  cannon: "#374151",
  mint: "#98FF98",
  coral: "#FB7185",
};

const PRODUCT_META: Record<
  string,
  {
    priceCents: number;
    ratingAvg: string;
    ratingCount: number;
    surface: ShoeSurface;
    shortDescription?: string;
    description?: string;
    weightGrams?: number;
    lengthMm?: number;
    widthMm?: number;
    heightMm?: number;
  }
> = {
  nike_metcon_10: {
    priceCents: 15000,
    ratingAvg: "4.60",
    ratingCount: 220,
    surface: ShoeSurface.INDOOR,
    description:
      "Nike Metcon 10 is built for strength training and gym workouts, offering a stable platform and durable upper for tough sessions.",
    weightGrams: 340,
    lengthMm: 340,
    widthMm: 230,
    heightMm: 140,
  },
  nike_structure_plus: {
    priceCents: 13000,
    ratingAvg: "4.40",
    ratingCount: 140,
    surface: ShoeSurface.ROAD,
    description:
      "Nike Structure Plus is a supportive road running shoe aimed at stable daily mileage with comfortable cushioning.",
    weightGrams: 295,
    lengthMm: 335,
    widthMm: 225,
    heightMm: 135,
  },
  nike_air_zoom_pegasus_41_gore_tex: {
    priceCents: 17000,
    ratingAvg: "4.50",
    ratingCount: 180,
    surface: ShoeSurface.ROAD,
    description:
      "Nike Air Zoom Pegasus 41 GORE-TEX is a weather-ready daily trainer designed to keep you moving in wet conditions.",
    weightGrams: 305,
    lengthMm: 335,
    widthMm: 225,
    heightMm: 135,
  },
  nike_air_winflo_11: {
    priceCents: 10500,
    ratingAvg: "4.30",
    ratingCount: 95,
    surface: ShoeSurface.ROAD,
    description:
      "Nike Air Winflo 11 is a comfortable road running shoe for easy runs and everyday wear with a cushioned ride.",
    weightGrams: 285,
    lengthMm: 335,
    widthMm: 225,
    heightMm: 135,
  },
};

const DEFAULT_EU_SIZES: Array<{ sizeEU: string; sizeUS?: string; sizeUK?: string }> = [
  { sizeEU: "36.0", sizeUS: "5.0", sizeUK: "3.5" },
  { sizeEU: "36.5", sizeUS: "5.5", sizeUK: "4.0" },
  { sizeEU: "37.0", sizeUS: "6.0", sizeUK: "4.5" },
  { sizeEU: "37.5", sizeUS: "6.5", sizeUK: "5.0" },
  { sizeEU: "38.0", sizeUS: "7.0", sizeUK: "5.5" },
  { sizeEU: "38.5", sizeUS: "7.5", sizeUK: "6.0" },
  { sizeEU: "39.0", sizeUS: "8.0", sizeUK: "6.5" },
  { sizeEU: "40.0", sizeUS: "8.5", sizeUK: "7.0" },
  { sizeEU: "40.5", sizeUS: "9.0", sizeUK: "7.5" },
  { sizeEU: "41.0", sizeUS: "9.5", sizeUK: "8.0" },
  { sizeEU: "42.0", sizeUS: "10.0", sizeUK: "8.5" },
  { sizeEU: "42.5", sizeUS: "10.5", sizeUK: "9.0" },
  { sizeEU: "43.0", sizeUS: "11.0", sizeUK: "9.5" },
  { sizeEU: "44.0", sizeUS: "11.5", sizeUK: "10.0" },
  { sizeEU: "44.5", sizeUS: "12.0", sizeUK: "10.5" },
  { sizeEU: "45.0", sizeUS: "12.5", sizeUK: "11.0" },
  { sizeEU: "46.0", sizeUS: "13.0", sizeUK: "12.0" },
];

const DEFAULT_STOCK_QTY = 10;
const STOCK_BY_COLOR: Record<string, number> = {
  "violet mix": 12,
  tattoo: 20,
};

// ---------- TYPES ----------

type View = "side" | "top" | "back";

type CloudinaryAsset = {
  secure_url?: string;
  public_id?: string;
  tags?: string[];
};

type PreparedImage = {
  url: string;
  publicId: string;
  sortOrder: number;
  alt: string;
  provider: string;
};

type PreparedSku = {
  sku: string;
  barcode: string;
  sizeEU: string;
  sizeUS?: string;
  sizeUK?: string;
  stockQty: number;
};

type PreparedColor = {
  folder: string;
  colorName: string;
  colorHex: string | null;
  images: PreparedImage[];
  skus: PreparedSku[];
};

type PreparedProduct = {
  modelKey: string;
  modelFolder: string;
  name: string;
  slug: string;
  categorySlug: "running" | "training" | "tennis";
  meta: {
    priceCents: number;
    ratingAvg: string;
    ratingCount: number;
    surface: ShoeSurface;
    shortDescription?: string;
    description?: string;
    weightGrams?: number;
    lengthMm?: number;
    widthMm?: number;
    heightMm?: number;
  };
  colors: PreparedColor[];
};

// ---------- HELPERS ----------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseFolderPath(folder: string): { root: string; modelFolder: string; colorName: string } {
  const parts = folder.split("/");
  if (parts.length < 3) throw new Error(`Invalid folder path: ${folder}`);
  return { root: parts[0], modelFolder: parts[1], colorName: parts[2] };
}

function toModelName(modelFolder: string) {
  return modelFolder.replace(/_/g, " ").replace(/-/g, " ").toUpperCase();
}

function slugifyForProduct(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function detectViewFromTags(tags: string[] | undefined): View | null {
  const t = (tags ?? []).map((x) => x.toLowerCase());
  if (t.includes("view_side")) return "side";
  if (t.includes("view_top")) return "top";
  if (t.includes("view_back")) return "back";
  return null;
}

function sortOrder(view: View) {
  if (view === "side") return 0;
  if (view === "top") return 1;
  return 2;
}

async function listAssetsByAssetFolder(assetFolder: string) {
  const out: CloudinaryAsset[] = [];
  let nextCursor: string | undefined;

  do {
    let q = cloudinary.search
      .expression(`resource_type:image AND asset_folder="${assetFolder}"`)
      .with_field("tags")
      .max_results(100);

    if (nextCursor) q = q.next_cursor(nextCursor);

    const res = await q.execute();
    out.push(...((res.resources ?? []) as CloudinaryAsset[]));
    nextCursor = res.next_cursor;
  } while (nextCursor);

  return out;
}

function normalizeSkuToken(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/\//g, "_")
    .replace(/\|/g, "_");
}

function makeSkuCode(opts: {
  brandSlug: string;
  productSlug: string;
  colorName: string;
  sizeEU: string;
}) {
  const eu = opts.sizeEU.replace(".", "_");
  const color = normalizeSkuToken(opts.colorName);

  return `${opts.brandSlug}-${opts.productSlug}-${color}-EU${eu}`
    .toUpperCase()
    .replace(/[^A-Z0-9\-_]/g, "");
}

function toDecimalString(x?: string) {
  return x ?? undefined;
}

function makeBarcode13(input: string) {
  const hex = crypto.createHash("sha1").update(input).digest("hex");
  const digits = hex.replace(/[a-f]/g, (c) => String(c.charCodeAt(0) % 10));
  return ("9" + digits).slice(0, 13);
}

function gramsToOunces(grams?: number) {
  if (!grams) return undefined;
  return Math.round(grams / 28.349523125);
}

function mmToInches2(mm?: number) {
  if (!mm) return undefined;
  return (mm / 25.4).toFixed(2);
}

async function acquireSeedLock(tx: Prisma.TransactionClient) {
  await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(987654323)`);
}

async function ensureCategory(
  tx: Prisma.TransactionClient,
  slug: string,
  name: string
) {
  return tx.category.upsert({
    where: { slug },
    update: { name },
    create: { slug, name },
  });
}

async function ensureBrand(
  tx: Prisma.TransactionClient,
  slug: string,
  name: string
) {
  return tx.brand.upsert({
    where: { slug },
    update: { name },
    create: { slug, name },
  });
}

// ---------- PREPARE DATA FIRST ----------

async function prepareData(): Promise<PreparedProduct[]> {
  requireEnv("CLOUDINARY_CLOUD_NAME");
  requireEnv("CLOUDINARY_API_KEY");
  requireEnv("CLOUDINARY_API_SECRET");

  await cloudinary.api.ping();

  const byModel = new Map<string, { modelFolder: string; folders: string[] }>();
  for (const folder of FOLDERS) {
    const { modelFolder } = parseFolderPath(folder);
    const modelKey = slugifyForProduct(modelFolder);

    const prev = byModel.get(modelKey);
    if (!prev) byModel.set(modelKey, { modelFolder, folders: [folder] });
    else prev.folders.push(folder);
  }

  const preparedProducts: PreparedProduct[] = [];

  for (const [modelKey, entry] of byModel.entries()) {
    const name = toModelName(entry.modelFolder);
    const slug = modelKey;

    const isMetcon = modelKey.includes("metcon");
    const isResolution = modelKey.includes("resolution");
    const categorySlug = isMetcon
      ? "training"
      : isResolution
        ? "tennis"
        : "running";

    const meta = PRODUCT_META[modelKey] ?? {
      priceCents: 0,
      ratingAvg: "0.00",
      ratingCount: 0,
      surface: ShoeSurface.ROAD,
      description: `${name} (seeded)`,
    };

    const colors: PreparedColor[] = [];

    for (const folder of entry.folders) {
      const { colorName } = parseFolderPath(folder);

      const colorHex =
        COLOR_HEX[colorName.toLowerCase()] ??
        COLOR_HEX[colorName] ??
        null;

      const assets = await listAssetsByAssetFolder(folder);

      const images = assets
        .map((a) => {
          const view = detectViewFromTags(a.tags);
          if (!view) return null;
          if (!a.secure_url || !a.public_id) return null;

          return {
            url: a.secure_url,
            publicId: a.public_id,
            sortOrder: sortOrder(view),
            alt: `${name} ${colorName} ${view}`,
            provider: "cloudinary",
          } satisfies PreparedImage;
        })
        .filter((x): x is PreparedImage => Boolean(x))
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const stockQty =
        STOCK_BY_COLOR[colorName.toLowerCase()] ??
        STOCK_BY_COLOR[colorName] ??
        DEFAULT_STOCK_QTY;

      const skus = DEFAULT_EU_SIZES.map((s) => {
        const sku = makeSkuCode({
          brandSlug: "nike",
          productSlug: slug,
          colorName,
          sizeEU: s.sizeEU,
        });

        return {
          sku,
          barcode: makeBarcode13(sku),
          sizeEU: s.sizeEU,
          sizeUS: toDecimalString(s.sizeUS),
          sizeUK: toDecimalString(s.sizeUK),
          stockQty,
        } satisfies PreparedSku;
      });

      colors.push({
        folder,
        colorName,
        colorHex,
        images,
        skus,
      });
    }

    preparedProducts.push({
      modelKey,
      modelFolder: entry.modelFolder,
      name,
      slug,
      categorySlug,
      meta,
      colors,
    });
  }

  return preparedProducts;
}

// ---------- MAIN ----------

export async function seedBatch4(prisma: PrismaClient) {
  console.log("Cloud:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("Key present:", !!process.env.CLOUDINARY_API_KEY);
  console.log("Secret present:", !!process.env.CLOUDINARY_API_SECRET);

  const preparedProducts = await prepareData();

  await prisma.$transaction(async (tx) => {
    await acquireSeedLock(tx);

    const catRunning = await ensureCategory(tx, "running", "Running");
    const catTennis = await ensureCategory(tx, "tennis", "Tennis");
    const catTraining = await ensureCategory(tx, "training", "Training");
    const nike = await ensureBrand(tx, "nike", "Nike");

    for (const prepared of preparedProducts) {
      const category =
        prepared.categorySlug === "training"
          ? catTraining
          : prepared.categorySlug === "tennis"
            ? catTennis
            : catRunning;

      const weightOunces = gramsToOunces(prepared.meta.weightGrams);
      const lengthInStr = mmToInches2(prepared.meta.lengthMm);
      const widthInStr = mmToInches2(prepared.meta.widthMm);
      const heightInStr = mmToInches2(prepared.meta.heightMm);

      const product = await tx.product.upsert({
        where: { slug: prepared.slug },
        update: {
          name: prepared.name,
          brandId: nike.id,
          categoryId: category.id,
          priceCents: prepared.meta.priceCents,
          ratingAvg: prepared.meta.ratingAvg,
          ratingCount: prepared.meta.ratingCount,
          surface: prepared.meta.surface,
          status: ProductStatus.ACTIVE,
          description: prepared.meta.description ?? `${prepared.name} (seeded)`,
          weightGrams: prepared.meta.weightGrams ?? undefined,
          weightOunces: weightOunces ?? undefined,
          lengthMm: prepared.meta.lengthMm ?? undefined,
          widthMm: prepared.meta.widthMm ?? undefined,
          heightMm: prepared.meta.heightMm ?? undefined,
          lengthIn: lengthInStr ? new Prisma.Decimal(lengthInStr) : undefined,
          widthIn: widthInStr ? new Prisma.Decimal(widthInStr) : undefined,
          heightIn: heightInStr ? new Prisma.Decimal(heightInStr) : undefined,
        },
        create: {
          slug: prepared.slug,
          name: prepared.name,
          description: prepared.meta.description ?? `${prepared.name} (seeded)`,
          brandId: nike.id,
          categoryId: category.id,
          currency: "EUR",
          priceCents: prepared.meta.priceCents,
          status: ProductStatus.ACTIVE,
          gender: Gender.UNISEX,
          surface: prepared.meta.surface,
          ratingAvg: prepared.meta.ratingAvg,
          ratingCount: prepared.meta.ratingCount,
          weightGrams: prepared.meta.weightGrams ?? null,
          weightOunces: weightOunces ?? null,
          lengthMm: prepared.meta.lengthMm ?? null,
          widthMm: prepared.meta.widthMm ?? null,
          heightMm: prepared.meta.heightMm ?? null,
          lengthIn: lengthInStr ? new Prisma.Decimal(lengthInStr) : null,
          widthIn: widthInStr ? new Prisma.Decimal(widthInStr) : null,
          heightIn: heightInStr ? new Prisma.Decimal(heightInStr) : null,
        },
      });

      for (const preparedColor of prepared.colors) {
        const color = await tx.productColor.upsert({
          where: {
            productId_colorName: {
              productId: product.id,
              colorName: preparedColor.colorName,
            },
          },
          update: {
            colorHex: preparedColor.colorHex ?? undefined,
          },
          create: {
            productId: product.id,
            colorName: preparedColor.colorName,
            colorHex: preparedColor.colorHex ?? undefined,
          },
        });

        const incomingPublicIds = new Set(
          preparedColor.images.map((img) => img.publicId)
        );
        const incomingSkus = new Set(
          preparedColor.skus.map((sku) => sku.sku)
        );

        for (const image of preparedColor.images) {
          await tx.productColorImage.upsert({
            where: { publicId: image.publicId },
            update: {
              colorId: color.id,
              url: image.url,
              alt: image.alt,
              sortOrder: image.sortOrder,
              provider: image.provider,
            },
            create: {
              colorId: color.id,
              url: image.url,
              publicId: image.publicId,
              alt: image.alt,
              sortOrder: image.sortOrder,
              provider: image.provider,
            },
          });
        }

        const existingImages = await tx.productColorImage.findMany({
          where: { colorId: color.id },
          select: { id: true, publicId: true },
        });

        const obsoleteImageIds = existingImages
          .filter((img) => !img.publicId || !incomingPublicIds.has(img.publicId))
          .map((img) => img.id);

        if (obsoleteImageIds.length > 0) {
          await tx.productColorImage.deleteMany({
            where: { id: { in: obsoleteImageIds } },
          });
        }

        for (const sku of preparedColor.skus) {
          await tx.productSku.upsert({
            where: { sku: sku.sku },
            update: {
              colorId: color.id,
              barcode: sku.barcode,
              sizeEU: sku.sizeEU,
              sizeUS: sku.sizeUS,
              sizeUK: sku.sizeUK,
              stockQty: sku.stockQty,
            },
            create: {
              colorId: color.id,
              sku: sku.sku,
              barcode: sku.barcode,
              sizeEU: sku.sizeEU,
              sizeUS: sku.sizeUS,
              sizeUK: sku.sizeUK,
              stockQty: sku.stockQty,
            },
          });
        }

        const existingSkus = await tx.productSku.findMany({
          where: { colorId: color.id },
          select: { id: true, sku: true },
        });

        const obsoleteSkuIds = existingSkus
          .filter((row) => !incomingSkus.has(row.sku))
          .map((row) => row.id);

        if (obsoleteSkuIds.length > 0) {
          await tx.productSku.deleteMany({
            where: { id: { in: obsoleteSkuIds } },
          });
        }

        console.log(
          `Seeded ${preparedColor.folder}: images=${preparedColor.images.length} skus=${preparedColor.skus.length} price=${prepared.meta.priceCents} rating=${prepared.meta.ratingAvg}(${prepared.meta.ratingCount}) stock=${preparedColor.skus[0]?.stockQty ?? DEFAULT_STOCK_QTY} colorHex=${preparedColor.colorHex ?? "n/a"}`
        );
      }
    }
  });
}
