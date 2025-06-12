const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  // Read the SVG source (updated file name)
  const svgPath = path.join(__dirname, '../public/leetcode-analytics-logo.svg');
  if (!fs.existsSync(svgPath)) {
    console.error('❌ SVG source not found:', svgPath);
    process.exit(1);
  }
  const svg = fs.readFileSync(svgPath);
  
  // Define the sizes we need
  const sizes = {
    'favicon-16x16.png': { width: 16, height: 16 },
    'favicon-24x24.png': { width: 24, height: 24 }, // for ICO
    'favicon-32x32.png': { width: 32, height: 32 },
    'favicon-48x48.png': { width: 48, height: 48 }, // for ICO
    'apple-touch-icon.png': { width: 180, height: 180 },
    'icon-192.png': { width: 192, height: 192 },
    'icon-512.png': { width: 512, height: 512 },
  };

  // Ensure public directory exists
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  // Generate each size
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(svg)
      .resize(size.width, size.height)
      .png()
      .toFile(path.join(__dirname, '../public', filename));
    
    console.log(`Generated ${filename}`);
  }

  // Build ICO file from multiple sizes (16,24,32,48)
  const icoSizes = ['favicon-16x16.png', 'favicon-24x24.png', 'favicon-32x32.png', 'favicon-48x48.png'];
  const pngBuffers = await Promise.all(
    icoSizes.map(file => fs.promises.readFile(path.join(__dirname, '../public', file)))
  );

  const icoBuffer = await toIco(pngBuffers);
  await fs.promises.writeFile(path.join(__dirname, '../public/favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico');

  console.log('✅  All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
}); 