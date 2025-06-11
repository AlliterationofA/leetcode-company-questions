const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  // Read the SVG file
  const svg = fs.readFileSync(path.join(__dirname, '../public/logo.svg'));
  
  // Define the sizes we need
  const sizes = {
    'favicon-16x16.png': { width: 16, height: 16 },
    'favicon-32x32.png': { width: 32, height: 32 },
    'apple-touch-icon.png': { width: 180, height: 180 },
    'icon-192.png': { width: 192, height: 192 },
    'icon-512.png': { width: 512, height: 512 },
    'og-image.png': { width: 1200, height: 630 }
  };

  // Generate each size
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(svg)
      .resize(size.width, size.height)
      .png()
      .toFile(path.join(__dirname, '../public', filename));
    
    console.log(`Generated ${filename}`);
  }

  // Use the 32x32 version as favicon.ico for now
  fs.copyFileSync(
    path.join(__dirname, '../public/favicon-32x32.png'),
    path.join(__dirname, '../public/favicon.ico')
  );

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error); 