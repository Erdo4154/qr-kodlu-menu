// ---------------------------------------------------------------
// ProductImage.tsx — Ürün fotoğrafını gösterir. Fotoğraf adresi
// boşsa ya da yüklenemezse (internet yok, link bozuk vs.) sayfa
// bozulmasın diye ürünün emojisini gösteren bir kutuya düşer.
// Bu "yedekli" yaklaşım gerçek projelerde standarttır.
// ---------------------------------------------------------------
import { useState } from "react";

interface ProductImageProps {
  src?: string;
  emoji: string;
  alt: string;
  className: string; // .product-thumb (kart) veya .detail-hero (detay)
}

export default function ProductImage({ src, emoji, alt, className }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`${className} img-fallback`} aria-hidden="true">
        {emoji}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy" // Sayfa açılışını hızlandırır: görünene kadar indirilmez
      onError={() => setFailed(true)}
    />
  );
}
