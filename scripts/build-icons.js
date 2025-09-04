const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define the source SVG for the icon
const createSVG = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="#22c55e" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.floor(size * 0.6)}" fill="white" text-anchor="middle" dy="0.35em" font-weight="bold">G</text>
</svg>`;

// Define the icons to be generated
const icons = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

const publicDir = path.join(__dirname, '..', 'public');

// Ensure the public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Main function to generate icons
async function generateIcons() {
  console.log('Generating PWA icons...');

  try {
    for (const icon of icons) {
      const svgContent = createSVG(icon.size);
      const svgBuffer = Buffer.from(svgContent);
      const outputPath = path.join(publicDir, icon.name);

      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Created ${icon.name}`);
    }
    console.log('\nIcon generation complete!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

// Run the script
generateIcons();
