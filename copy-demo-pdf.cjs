const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourcePath = path.join(__dirname, 'public', 'pdf', 'demo.pdf');
const destDir = path.join(__dirname, 'src-tauri', 'pdf');
const destPath = path.join(destDir, 'demo.pdf');

// Create the destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  console.log(`Creating directory: ${destDir}`);
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy the file
try {
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Successfully copied demo PDF from ${sourcePath} to ${destPath}`);
} catch (error) {
  console.error(`Error copying demo PDF: ${error.message}`);
  process.exit(1);
} 