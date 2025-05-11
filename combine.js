/* global Set */
const fs = require("fs");
const path = require("path");

// Ensure at least one file is provided
if (process.argv.length < 3) {
  console.error("Usage: npm run combine <file1> [file2] ...");
  process.exit(1);
}

// Extract arguments (file paths) and remove duplicates automatically
const files = process.argv.slice(2);
const uniqueFiles = new Set(
  files
    .map((file) => file.trim())
    .filter(Boolean) // Remove empty entries
    .map((file) => file.replace(/\s+/g, "")) // Remove all whitespace
);

// Log if duplicates were removed
if (uniqueFiles.size < files.length) {
  console.log(
    `ℹ️ Removed ${files.length - uniqueFiles.size} duplicate file(s)`
  );
}

const outputFile = "combined_output.txt"; // Change this if needed
let combinedContent = "Files combined: \n";

// Add the list of file routes at the top
uniqueFiles.forEach((file) => {
  combinedContent += `- ${file}\n`;
});

combinedContent += "\n"; // Add a blank line after the file list

// Add the actual content
uniqueFiles.forEach((file) => {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const extension = path.extname(file).slice(1);
  combinedContent += `${file}\n\`\`\`${extension}\n${fileContent.trimEnd()}\n\`\`\`\n\n`;
  console.log(`✅ Added: ${file}`);
});

fs.writeFileSync(outputFile, combinedContent.trim());
console.log(`\n📝 Combined content saved to: ${outputFile}`);
