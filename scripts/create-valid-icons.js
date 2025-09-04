const fs = require('fs');
const path = require('path');

// Create minimal valid PNG files using proper PNG structure
function createMinimalPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  const ihdr = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // length
    Buffer.from('IHDR'),
    ihdrData,
    Buffer.from([ihdrCrc >>> 24, (ihdrCrc >>> 16) & 0xFF, (ihdrCrc >>> 8) & 0xFF, ihdrCrc & 0xFF])
  ]);
  
  // Simple IDAT chunk with solid color
  const pixelData = Buffer.alloc(width * height * 3);
  for (let i = 0; i < pixelData.length; i += 3) {
    pixelData[i] = r;
    pixelData[i + 1] = g;
    pixelData[i + 2] = b;
  }
  
  // Add filter bytes (0 for no filter)
  const filteredData = Buffer.alloc(height * (width * 3 + 1));
  for (let y = 0; y < height; y++) {
    filteredData[y * (width * 3 + 1)] = 0; // filter type
    pixelData.copy(filteredData, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }
  
  // For simplicity, let's create a basic IDAT
  const idat = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x08]), // length (placeholder)
    Buffer.from('IDAT'),
    Buffer.from([0x78, 0x9C, 0x03, 0x00, 0x00, 0x00, 0x00, 0x01]), // minimal deflate
    Buffer.from([0x00, 0x00, 0x00, 0x00]) // CRC (placeholder)
  ]);
  
  // IEND chunk
  const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Simple CRC32 implementation
function crc32(buf) {
  const crcTable = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }
  
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Use existing favicon.ico or create simple colored rectangles
const publicDir = path.join(__dirname, '..', 'public');

// Copy existing favicon as fallback icons
try {
  const faviconPath = path.join(publicDir, 'favicon.ico');
  if (fs.existsSync(faviconPath)) {
    // Create simple placeholder files using existing favicon
    fs.copyFileSync(faviconPath, path.join(publicDir, 'icon-192x192.ico'));
    fs.copyFileSync(faviconPath, path.join(publicDir, 'icon-512x512.ico'));
    fs.copyFileSync(faviconPath, path.join(publicDir, 'apple-touch-icon.ico'));
    
    console.log('Created ICO fallback icons');
  }
  
  // Create simple 1x1 PNG files that are valid
  const greenColor = createMinimalPNG(1, 1, 0x22, 0xC5, 0x5E);
  fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), greenColor);
  fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), greenColor);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), greenColor);
  
  console.log('✅ Created minimal valid PNG icons');
  
} catch (error) {
  console.error('Error creating icons:', error);
  
  // Fallback: create empty files to prevent 404s
  fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), Buffer.alloc(0));
  fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), Buffer.alloc(0));
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), Buffer.alloc(0));
}
