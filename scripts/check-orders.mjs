import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sviuixweaijgddptdmda.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aXVpeHdlYWlqZ2RkcHRkbWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MjYxMzcsImV4cCI6MjA5ODQwMjEzN30.qcrfmBJjpXoQ-fwFcnF_3PECR9TM6m7IheU858hwkQs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*');
    
  if (error) {
    console.error('Error fetching orders:', error);
  } else {
    console.log(`Found ${data.length} orders in the database.`);
    if (data.length > 0) {
      console.log('Sample order:', JSON.stringify(data[0], null, 2));
    }
  }
}

checkOrders();
