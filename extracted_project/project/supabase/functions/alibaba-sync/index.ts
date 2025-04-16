import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface AlibabaProduct {
  productId: string;
  subject: string;
  description: string;
  price: {
    amount: number;
  };
  images: {
    mainImage: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // This would be replaced with actual Alibaba API call
    const mockAlibabaProducts: AlibabaProduct[] = [
      {
        productId: 'ALI001',
        subject: 'Wireless Earbuds',
        description: 'High-quality wireless earbuds with noise cancellation',
        price: { amount: 29.99 },
        images: { mainImage: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb' },
      },
      // Add more mock products as needed
    ];

    // Sync products to Supabase
    for (const product of mockAlibabaProducts) {
      const { error } = await supabase
        .from('products')
        .upsert({
          alibaba_id: product.productId,
          name: product.subject,
          description: product.description,
          price: product.price.amount,
          image_url: product.images.mainImage,
        });

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ message: 'Products synced successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});