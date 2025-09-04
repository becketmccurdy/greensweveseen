// Simple script to generate PWA icons
const fs = require('fs');
const path = require('path');

// Create a simple SVG that we'll convert to PNG
function createSVG(size, text = 'G') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="100%" height="100%" fill="#22c55e" rx="20"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.floor(size * 0.4)}" fill="white" text-anchor="middle" dy="0.35em" font-weight="bold">${text}</text>
  </svg>`;
}

// Since we don't have a PNG conversion library, let's create a simple HTML file that can be used to generate the icons
const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .icon { margin: 10px; }
        canvas { border: 1px solid #ccc; }
    </style>
</head>
<body>
    <h1>PWA Icon Generator</h1>
    <div class="icon">
        <h3>192x192 Icon</h3>
        <canvas id="icon192" width="192" height="192"></canvas>
        <br><button onclick="download('icon192', 'icon-192x192.png')">Download</button>
    </div>
    <div class="icon">
        <h3>512x512 Icon</h3>
        <canvas id="icon512" width="512" height="512"></canvas>
        <br><button onclick="download('icon512', 'icon-512x512.png')">Download</button>
    </div>
    <div class="icon">
        <h3>180x180 Apple Touch Icon</h3>
        <canvas id="apple180" width="180" height="180"></canvas>
        <br><button onclick="download('apple180', 'apple-touch-icon.png')">Download</button>
    </div>

    <script>
        function drawIcon(canvasId, size) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');
            
            // Background
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(0, 0, size, size);
            
            // Rounded corners effect
            ctx.globalCompositeOperation = 'destination-in';
            ctx.beginPath();
            ctx.roundRect(0, 0, size, size, size * 0.1);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            
            // Text
            ctx.fillStyle = 'white';
            ctx.font = \`bold \${Math.floor(size * 0.4)}px Arial\`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('G', size / 2, size / 2);
        }
        
        function download(canvasId, filename) {
            const canvas = document.getElementById(canvasId);
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        
        // Generate icons when page loads
        drawIcon('icon192', 192);
        drawIcon('icon512', 512);
        drawIcon('apple180', 180);
    </script>
</body>
</html>`;

// Write the HTML file
fs.writeFileSync(path.join(__dirname, '..', 'icon-generator.html'), htmlTemplate);
console.log('Created icon-generator.html - open this in a browser to download the icons');
