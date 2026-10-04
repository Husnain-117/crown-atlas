#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error("OPENAI_API_KEY is missing. Add it to .env or .env.local.");
  process.exit(1);
}

const client = new OpenAI({ apiKey: API_KEY });

const SAN_DIEGO_CITIES = [
  { name: "La Jolla", slug: "la-jolla-ca" },
  { name: "Pacific Beach", slug: "pacific-beach-ca" },
  { name: "Ocean Beach", slug: "ocean-beach-ca" },
  { name: "Coronado", slug: "coronado-ca" },
  { name: "Del Mar", slug: "del-mar-ca" },
  { name: "Carlsbad", slug: "carlsbad-ca" },
  { name: "Gaslamp Quarter", slug: "gaslamp-quarter-ca" },
  { name: "Little Italy", slug: "little-italy-ca" },
  { name: "East Village", slug: "east-village-ca" },
  { name: "Hillcrest", slug: "hillcrest-ca" },
  { name: "North Park", slug: "north-park-ca" },
  { name: "Rancho Bernardo", slug: "rancho-bernardo-ca" },
  { name: "Poway", slug: "poway-ca" },
  { name: "Scripps Ranch", slug: "scripps-ranch-ca" },
  { name: "Chula Vista", slug: "chula-vista-ca" },
];

const OUTPUT_DIR = path.join(process.cwd(), "public", "city", "san-diego");

const PROMPT_TEMPLATE = (cityName) => `Generate a stunning, photorealistic hero image for a real estate website card
representing ${cityName}, San Diego, California.

Style: Professional real estate marketing photography
Lighting: Golden hour or blue hour, warm and inviting
Mood: Aspirational, luxurious, neighborhood-authentic
Composition: Wide landscape format, showcasing the neighborhood's most iconic
visual identity - whether that's coastline, architecture, skyline, or lifestyle

Requirements:
- Ultra realistic, 4K quality
- No text or watermarks
- Colors should be vivid but natural
- Should feel like a place someone would want to live
- Capture what makes ${cityName} unique and distinct from other neighborhoods`;

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    force: args.includes("--force"),
  };
}

async function readImageBufferFromResponse(imageData) {
  if (imageData?.b64_json) {
    return Buffer.from(imageData.b64_json, "base64");
  }

  if (imageData?.url) {
    const response = await fetch(imageData.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image URL: HTTP ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error("No image bytes returned (missing b64_json/url).");
}

async function generateWithModel(prompt, model) {
  if (model === "gpt-image-1") {
    const response = await client.images.generate({
      model,
      prompt,
      size: "1536x1024",
    });
    return readImageBufferFromResponse(response.data?.[0]);
  }

  const response = await client.images.generate({
    model,
    prompt,
    size: "1792x1024",
    quality: "hd",
    style: "natural",
  });
  return readImageBufferFromResponse(response.data?.[0]);
}

async function generateCityImage(cityName) {
  const prompt = PROMPT_TEMPLATE(cityName);

  try {
    const image = await generateWithModel(prompt, "gpt-image-1");
    return { image, modelUsed: "gpt-image-1" };
  } catch (firstError) {
    console.warn(`[fallback] ${cityName}: gpt-image-1 failed -> ${firstError.message}`);
    const image = await generateWithModel(prompt, "dall-e-3");
    return { image, modelUsed: "dall-e-3" };
  }
}

async function main() {
  const { force } = parseArgs();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Cities: ${SAN_DIEGO_CITIES.length}`);
  console.log(`Mode: ${force ? "force overwrite" : "skip existing"}`);
  console.log("");

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < SAN_DIEGO_CITIES.length; i += 1) {
    const city = SAN_DIEGO_CITIES[i];
    const outputPath = path.join(OUTPUT_DIR, `${city.slug}.png`);

    if (!force && fs.existsSync(outputPath)) {
      skipped += 1;
      console.log(`[${i + 1}/${SAN_DIEGO_CITIES.length}] ${city.name}: skipped (exists)`);
      continue;
    }

    try {
      const { image, modelUsed } = await generateCityImage(city.name);
      fs.writeFileSync(outputPath, image);
      created += 1;
      console.log(`[${i + 1}/${SAN_DIEGO_CITIES.length}] ${city.name}: saved (${modelUsed})`);
    } catch (error) {
      failed += 1;
      console.error(`[${i + 1}/${SAN_DIEGO_CITIES.length}] ${city.name}: failed -> ${error.message}`);
    }
  }

  console.log("");
  console.log("Done.");
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
