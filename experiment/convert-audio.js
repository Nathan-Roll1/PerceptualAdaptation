// Utility script to convert audio files to a web-compatible format
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audioDir = path.join(process.cwd(), 'audio');
const outputDir = path.join(process.cwd(), 'web-audio');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Get all WAV files in the audio directory
const audioFiles = fs.readdirSync(audioDir)
  .filter(file => file.endsWith('.wav') || file.endsWith('.mp3'));

console.log(`Found ${audioFiles.length} audio files to convert`);

// Convert each file to PCM 16-bit format for web compatibility with audio normalization
audioFiles.forEach(file => {
  const inputPath = path.join(audioDir, file);
  const outputPath = path.join(outputDir, file);
  
  try {
    console.log(`Converting and normalizing ${file}...`);
    // Use ffmpeg with audio normalization filters:
    // 1. loudnorm - EBU R128 loudness normalization
    // 2. Convert to 16-bit PCM format
    // 3. Maintain original sample rate
    // Target integrated loudness: -23 LUFS (standard for broadcast)
    execSync(`ffmpeg -i "${inputPath}" -af "loudnorm=I=-23:LRA=7:tp=-2:print_format=summary" -ar 16000 -acodec pcm_s16le "${outputPath}" -y`);
    console.log(`Successfully converted and normalized ${file}`);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('Conversion complete. Audio files saved in web-audio/ directory');