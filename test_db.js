const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://169.58.106.34:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('brand_contexts').insert({
    user_id: '00000000-0000-0000-0000-000000000000', // invalid uuid but might give a specific error
    product_name: 'test',
    target_audience: 'test',
    main_benefit: 'test',
    price: 'test'
  });
  console.log(error);
}

test();
