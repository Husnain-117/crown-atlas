import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const cityDataPath = path.join(__dirname, '../src/lib/city-data.ts');

// Function to call OpenAI API
async function generateDescription(neighborhoodName, cityName, shortDescription) {
  const prompt = `Write a detailed, SEO-friendly paragraph (150-200 words) about ${neighborhoodName} in ${cityName}, California.

Current short description: "${shortDescription}"

The description should:
- Be informative and engaging for homebuyers
- Include specific details about the neighborhood's character, lifestyle, and appeal
- Mention key features like amenities, architecture styles, demographics, local attractions
- Use natural language that sounds professional but approachable
- Focus on what makes this neighborhood unique and desirable
- Include keywords relevant for real estate SEO
- Be written in third person, present tense
- Sound authoritative and factual

Return ONLY the paragraph text, no additional formatting or quotes.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert real estate copywriter specializing in California neighborhoods. Write detailed, SEO-optimized descriptions that help homebuyers understand what makes each neighborhood special.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error generating description for ${neighborhoodName}:`, error.message);
    return null;
  }
}

// Function to extract all neighborhoods from city-data.ts
function extractNeighborhoods(content) {
  const neighborhoods = [];

  // Find all city data objects
  const cityMatches = content.matchAll(/const (\w+)Data: CityData = \{[\s\S]*?^}/gm);

  for (const cityMatch of cityMatches) {
    const cityBlock = cityMatch[0];
    const cityVarName = cityMatch[1];

    // Extract city name
    const cityNameMatch = cityBlock.match(/name: "([^"]+)"/);
    const cityName = cityNameMatch ? cityNameMatch[1] : 'Unknown';

    // Find neighborhood categories within this city
    const neighborhoodCategoriesMatch = cityBlock.match(/neighborhoodCategories: \[([\s\S]*?)\s+\],\s+facts:/);

    if (neighborhoodCategoriesMatch) {
      const categoriesBlock = neighborhoodCategoriesMatch[1];

      // Extract individual neighborhoods
      const hoodMatches = categoriesBlock.matchAll(/\{\s*name: "([^"]+)",\s*description: "([^"]+)",\s*href: "([^"]+)"/g);

      for (const hoodMatch of hoodMatches) {
        neighborhoods.push({
          city: cityName,
          cityVar: cityVarName,
          name: hoodMatch[1],
          description: hoodMatch[2],
          href: hoodMatch[3]
        });
      }
    }
  }

  return neighborhoods;
}

// Main function
async function main() {
  console.log('🚀 Starting neighborhood description generation...\n');

  if (!OPENAI_API_KEY) {
    console.error('❌ ERROR: OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  // Read city-data.ts
  const content = fs.readFileSync(cityDataPath, 'utf-8');

  // Extract all neighborhoods
  const neighborhoods = extractNeighborhoods(content);
  console.log(`📍 Found ${neighborhoods.length} neighborhoods across all cities\n`);

  // Generate descriptions for each neighborhood
  let updatedContent = content;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < neighborhoods.length; i++) {
    const hood = neighborhoods[i];
    console.log(`\n[${i + 1}/${neighborhoods.length}] Generating description for: ${hood.name}, ${hood.city}`);

    // Generate description using OpenAI
    const detailedDescription = await generateDescription(hood.name, hood.city, hood.description);

    if (detailedDescription) {
      // Find and update the neighborhood entry in the file
      const searchPattern = new RegExp(
        `(\\{\\s*name: "${hood.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",\\s*description: "${hood.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",\\s*href: "${hood.href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}")`,
        'g'
      );

      const replacement = `$1,\n          detailedDescription: "${detailedDescription.replace(/"/g, '\\"')}"`;

      updatedContent = updatedContent.replace(searchPattern, replacement);

      console.log(`✅ Generated (${detailedDescription.length} chars)`);
      successCount++;

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`❌ Failed to generate`);
      errorCount++;
    }
  }

  // Write updated content back to file
  fs.writeFileSync(cityDataPath, updatedContent, 'utf-8');

  console.log(`\n\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${neighborhoods.length}`);
  console.log(`\n✨ Updated ${cityDataPath}`);
}

main().catch(console.error);
