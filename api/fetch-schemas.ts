import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = 'services.json';
// Define the output subdirectory name
const OUTPUT_SUBFOLDER = 'schemas'; 

interface ServiceConfig {
  [serviceName: string]: string;
}

// Simple native helper to parse a .env file if process.env.API_BASE_URL isn't set
async function loadEnvFallback(): Promise<string | undefined> {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL;

  // Check common Vite env files (.env.local first, then .env)
  const envFiles = ['.env.local', '.env'];
  const rootDir = path.join(__dirname, '..');

  for (const file of envFiles) {
    try {
      const envPath = path.join(rootDir, file);
      const content = await fs.readFile(envPath, 'utf-8');
      
      // Look for VITE_API_BASE_URL or API_BASE_URL
      const match = content.match(/^(?:VITE_)?API_BASE_URL\s*=\s*(.*)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/['"]/g, ''); // Clean quotes
      }
    } catch {
      // File didn't exist or couldn't be read, move to next
    }
  }
  return undefined;
}

async function fetchOpenApiDefinitions(): Promise<void> {
  const configPath = path.join(__dirname, CONFIG_FILE);
  const outputDir = path.join(__dirname, OUTPUT_SUBFOLDER);

  // 1. Get the base URL from the environment or .env files
  let baseUrl = await loadEnvFallback();

  if (!baseUrl) {
    console.error('🚨 Error: API_BASE_URL or VITE_API_BASE_URL is not defined in your environment or .env files.');
    process.exit(1);
  }

  // Ensure baseUrl has a protocol scheme, otherwise new URL() will throw an error
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = `https://${baseUrl}`;
  }

  try {
    const configFileContent = await fs.readFile(configPath, 'utf-8');
    const services: ServiceConfig = JSON.parse(configFileContent);

    // Ensure the api/schemas directory exists before downloading
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`🚀 Starting OpenAPI download using base URL: ${baseUrl}`);
    console.log(`📂 Output folder: api/${OUTPUT_SUBFOLDER}/\n`);

    for (const [serviceName, apiPath] of Object.entries(services)) {
      try {
        // 2. Combine the base URL with the service path safely
        const url = new URL(apiPath, baseUrl).href;
        console.log(`⏳ Fetching [${serviceName}] from ${url}...`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const openApiData = await response.json();
        
        // Target path inside the subfolder (e.g., api/schemas/auth-service.json)
        const outputPath = path.join(outputDir, `${serviceName}.json`);
        
        await fs.writeFile(outputPath, JSON.stringify(openApiData, null, 2), 'utf-8');
        console.log(`✅ Saved: ${OUTPUT_SUBFOLDER}/${serviceName}.json\n`);
        
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
        console.error(`❌ Failed to download [${serviceName}]: ${message}\n`);
      }
    }

    console.log('🏁 All downloads processed.');

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`🚨 Critical Error: Could not process ${CONFIG_FILE}. Base error:`, message);
    process.exit(1);
  }
}

fetchOpenApiDefinitions();