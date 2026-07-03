import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const imagesToDownload = [
  // Products
  { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&fm=webp', name: 'product-1.webp' },
  { url: 'https://images.unsplash.com/photo-1550614000-0b1d7ad3d1eb?w=600&q=80&fm=webp', name: 'product-2.webp' },
  { url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80&fm=webp', name: 'product-3.webp' },
  { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&fm=webp', name: 'product-4.webp' },
  { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80&fm=webp', name: 'product-5.webp' },
  { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80&fm=webp', name: 'product-6.webp' },
  { url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80&fm=webp', name: 'product-7.webp' },
  { url: 'https://images.unsplash.com/photo-1583292655851-27f1e0f0b8e5?w=600&q=80&fm=webp', name: 'product-8.webp' },
  
  // Product Placeholders
  { url: 'https://via.placeholder.com/600x800?text=Sage+Linen+Kurta', name: 'placeholder-product-1.png' },
  { url: 'https://via.placeholder.com/600x800?text=Terracotta+Flow+Tunic', name: 'placeholder-product-2.png' },
  { url: 'https://via.placeholder.com/600x800?text=Burgundy+Festive+Set', name: 'placeholder-product-3.png' },
  { url: 'https://via.placeholder.com/600x800?text=Cream+Palazzo+Set', name: 'placeholder-product-4.png' },
  { url: 'https://via.placeholder.com/600x800?text=Olive+Drape+Dress', name: 'placeholder-product-5.png' },
  { url: 'https://via.placeholder.com/600x800?text=Gold+Embroidered+Kurta', name: 'placeholder-product-6.png' },
  { url: 'https://via.placeholder.com/600x800?text=Everyday+Cotton+Tunic', name: 'placeholder-product-7.png' },
  { url: 'https://via.placeholder.com/600x800?text=Printed+Silk+Scarf+Set', name: 'placeholder-product-8.png' },
  
  // Brand Story
  { url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80&fm=webp', name: 'brand-story-1.webp' },
  { url: 'https://via.placeholder.com/600x800?text=Fabric+Detail', name: 'placeholder-brand-1.png' },
  { url: 'https://via.placeholder.com/600x800?text=Brand+Board', name: 'placeholder-brand-2.png' },

  // Collections
  { url: 'https://images.unsplash.com/photo-1583292655851-27f1e0f0b8e5?w=800&q=80&fm=webp', name: 'collection-1.webp' },
  { url: 'https://via.placeholder.com/800x1000?text=Kurtas+%26+Tunics', name: 'placeholder-collection-1.png' },
  { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80&fm=webp', name: 'collection-2.webp' },
  { url: 'https://via.placeholder.com/800x1000?text=Fusion+Wear', name: 'placeholder-collection-2.png' },
  { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80&fm=webp', name: 'collection-3.webp' },
  { url: 'https://via.placeholder.com/800x1000?text=Occasion+Edit', name: 'placeholder-collection-3.png' },
  { url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&fm=webp', name: 'collection-4.webp' },
  { url: 'https://via.placeholder.com/800x1000?text=Everyday+Essentials', name: 'placeholder-collection-4.png' },

  // Hero
  { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1800&q=80&fm=webp', name: 'hero-1.webp' },
  { url: 'https://via.placeholder.com/1800x1000?text=New+Season', name: 'placeholder-hero-1.png' },
  { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=80&fm=webp', name: 'hero-2.webp' },
  { url: 'https://via.placeholder.com/1800x1000?text=Fusion+Edit', name: 'placeholder-hero-2.png' },
  { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=80&fm=webp', name: 'hero-3.webp' },
  { url: 'https://via.placeholder.com/1800x1000?text=The+Collection', name: 'placeholder-hero-3.png' },

  // Lookbook
  { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80&fm=webp', name: 'lookbook-1.webp' },
  { url: 'https://via.placeholder.com/900x900?text=Fusion+Edit', name: 'placeholder-lookbook-1.png' },
  { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80&fm=webp', name: 'lookbook-2.webp' },
  { url: 'https://via.placeholder.com/600x600?text=Soft+Drapes', name: 'placeholder-lookbook-2.png' },
  { url: 'https://images.unsplash.com/photo-1502716110395-3002d96b0a0b?w=600&q=80&fm=webp', name: 'lookbook-3.webp' },
  { url: 'https://via.placeholder.com/600x600?text=Natural+Light', name: 'placeholder-lookbook-3.png' },
  { url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80&fm=webp', name: 'lookbook-4.webp' },
  { url: 'https://via.placeholder.com/600x600?text=Festive+Mood', name: 'placeholder-lookbook-4.png' },
  { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&q=80&fm=webp', name: 'lookbook-5.webp' },
  { url: 'https://via.placeholder.com/900x600?text=Everyday+Grace', name: 'placeholder-lookbook-5.png' },

  // Cart/Checkout Items
  { url: 'https://via.placeholder.com/48x64?text=Item', name: 'placeholder-item-1.png' },
  { url: 'https://via.placeholder.com/80x100?text=Item', name: 'placeholder-item-2.png' }
];

const destDir = path.resolve('public/images');

async function downloadFile(url, fileName) {
  const destPath = path.join(destDir, fileName);
  if (fs.existsSync(destPath)) {
    console.log(`Skipping ${fileName}, already exists.`);
    return;
  }
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    const fileStream = fs.createWriteStream(destPath);
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
    console.log(`Downloaded ${fileName}`);
  } catch (error) {
    console.error(`Error downloading ${fileName} from ${url}:`, error.message);
  }
}

async function run() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const img of imagesToDownload) {
    await downloadFile(img.url, img.name);
  }
  console.log('All downloads finished!');
}

run();
