// Menünün QR kodunu üretir: node scripts/generate-qr.js [hedef-url] [cikti-dosyasi]
import QRCode from "qrcode";
import path from "node:path";

const url = process.argv[2] ?? "https://qr-kodlu-menu-qwu6-rose.vercel.app/git.html";
const out = path.resolve(process.argv[3] ?? "qr-kod.png");

await QRCode.toFile(out, url, {
  width: 1024,
  margin: 2,
  errorCorrectionLevel: "H",
});

console.log(`QR kod üretildi: ${out}`);
console.log(`Hedef adres: ${url}`);
