import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const PUBLIC_DIR = 'public';

async function generateImages() {
  try {
    // Read the SVG file
    const svgBuffer = await fs.readFile(path.join(PUBLIC_DIR, 'leetcode-analytics-logo.svg'));
    
    // Create base PNG from SVG
    const basePng = await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toBuffer();

    // Generate different sizes
    const sizes = {
      'icon.png': 192,
      'icon-192.png': 192,
      'icon-512.png': 512,
      'apple-icon.png': 180,
    };

    // Generate PNG files
    for (const [filename, size] of Object.entries(sizes)) {
      await sharp(basePng)
        .resize(size, size)
        .png()
        .toFile(path.join(PUBLIC_DIR, filename));
      console.log(`Generated ${filename}`);
    }

    // Generate favicon.ico (16x16 PNG)
    await sharp(basePng)
      .resize(16, 16)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'favicon.png'));
    console.log('Generated favicon.png');

    // Generate OG and Twitter images
    const ogImageSize = { width: 1200, height: 630 };
    const twitterImageSize = { width: 1200, height: 600 };

    // Helper function to create social media images
    async function createSocialImage(buffer, size, outputName, title) {
      const logoSize = Math.min(size.width, size.height) * 0.4;
      
      // Create a background
      const image = await sharp({
        create: {
          width: size.width,
          height: size.height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
        .composite([
          {
            input: buffer,
            top: Math.floor((size.height - logoSize) / 2),
            left: Math.floor((size.width - logoSize) / 2),
            width: logoSize,
            height: logoSize
          }
        ])
        .png()
        .toFile(path.join(PUBLIC_DIR, outputName));
      
      console.log(`Generated ${outputName}`);
    }

    await createSocialImage(basePng, ogImageSize, 'og-image.png');
    await createSocialImage(basePng, twitterImageSize, 'twitter-image.png');

    // Save the original SVG as safari-pinned-tab.svg
    await fs.copyFile(
      path.join(PUBLIC_DIR, 'leetcode-analytics-logo.svg'),
      path.join(PUBLIC_DIR, 'safari-pinned-tab.svg')
    );
    console.log('Generated safari-pinned-tab.svg');

    console.log('All images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
    process.exit(1);
  }
}

generateImages(); 