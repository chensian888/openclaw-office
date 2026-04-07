import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'dist', 'static');

async function compressImage(input, output, quality = 60) {
  try {
    const metadata = await sharp(input).metadata();
    console.log(`压缩：${input}`);
    console.log(`  原始大小：${(fs.statSync(input).size / 1024).toFixed(0)} KB`);
    console.log(`  格式：${metadata.format}, 尺寸：${metadata.width}x${metadata.height}`);
    
    await sharp(input)
      .toFormat(metadata.format, { quality })
      .toFile(output);
    
    const newSize = fs.statSync(output).size;
    console.log(`  压缩后：${(newSize / 1024).toFixed(0)} KB`);
    console.log(`  压缩率：${((1 - newSize / fs.statSync(input).size) * 100).toFixed(1)}%\n`);
  } catch (err) {
    console.error(`压缩失败 ${input}:`, err.message);
  }
}

async function main() {
  console.log('开始压缩图片...\n');
  
  // LITE 模式需要的图片
  await compressImage(
    path.join(srcDir, 'star-idle-v5.png'),
    path.join(srcDir, 'star-idle-v5-compressed.png'),
    60
  );
  
  await compressImage(
    path.join(srcDir, 'office_bg_small.webp'),
    path.join(srcDir, 'office_bg_small-compressed.webp'),
    60
  );
  
  console.log('压缩完成！');
}

main();
