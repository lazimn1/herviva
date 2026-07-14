import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sviuixweaijgddptdmda.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aXVpeHdlYWlqZ2RkcHRkbWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MjYxMzcsImV4cCI6MjA5ODQwMjEzN30.qcrfmBJjpXoQ-fwFcnF_3PECR9TM6m7IheU858hwkQs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function deduplicateProducts() {
  console.log('Fetching all products from Supabase...');
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true }); // keep the oldest

  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  console.log(`Total products fetched: ${products.length}`);

  const seenNames = new Set();
  const seenImages = new Set();
  const toDelete = [];

  for (const product of products) {
    const nameLower = product.name?.trim().toLowerCase();
    const imageLower = product.image?.trim().toLowerCase();

    const isDupName = nameLower && seenNames.has(nameLower);
    const isDupImage = imageLower && seenImages.has(imageLower);

    if (isDupName || isDupImage) {
      toDelete.push(product.id);
      console.log(`  ✗ Duplicate: [id=${product.id}] "${product.name}" (${product.image})`);
    } else {
      if (nameLower) seenNames.add(nameLower);
      if (imageLower) seenImages.add(imageLower);
      console.log(`  ✓ Keeping:   [id=${product.id}] "${product.name}"`);
    }
  }

  if (toDelete.length === 0) {
    console.log('\nNo duplicates found. All products are unique!');
    return;
  }

  console.log(`\nDeleting ${toDelete.length} duplicate product(s): ids [${toDelete.join(', ')}]`);

  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .in('id', toDelete);

  if (deleteError) {
    console.error('Error deleting duplicates:', deleteError);
    process.exit(1);
  }

  console.log('Done! Duplicates removed successfully.');
}

deduplicateProducts();
