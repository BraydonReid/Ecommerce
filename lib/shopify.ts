import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION, DeliveryMethod } from '@shopify/shopify-api';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: ['read_orders', 'read_products', 'read_shipping'],
  hostName: process.env.SHOPIFY_HOST!.replace(/https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
});

export default shopify;

export interface ShopifyOrder {
  id: number;
  order_number: number;
  total_price: string;
  shipping_lines: Array<{
    code: string;
    price: string;
    title: string;
  }>;
  shipping_address?: {
    address1: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  line_items: Array<{
    id: number;
    product_id: number;
    title: string;
    quantity: number;
    price: string;
    grams: number;
    sku: string;
  }>;
  created_at: string;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  variants: Array<{
    id: number;
    sku: string;
    grams: number;
    price: string;
  }>;
}

/**
 * Fetch orders from Shopify for a given merchant
 */
export async function fetchShopifyOrders(
  shop: string,
  accessToken: string,
  limit: number = 50
): Promise<ShopifyOrder[]> {
  const session = shopify.session.customAppSession(shop);
  session.accessToken = accessToken;

  const client = new shopify.clients.Rest({ session });

  try {
    const response = await client.get({
      path: 'orders',
      query: { limit: limit.toString(), status: 'any' },
    });

    return (response.body as any).orders || [];
  } catch (error) {
    console.error('Error fetching Shopify orders:', error);
    throw error;
  }
}

/**
 * Fetch products from Shopify for a given merchant
 */
export async function fetchShopifyProducts(
  shop: string,
  accessToken: string,
  limit: number = 50
): Promise<ShopifyProduct[]> {
  const session = shopify.session.customAppSession(shop);
  session.accessToken = accessToken;

  const client = new shopify.clients.Rest({ session });

  try {
    const response = await client.get({
      path: 'products',
      query: { limit: limit.toString() },
    });

    return (response.body as any).products || [];
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
}

/**
 * Register webhooks for order events
 */
export async function registerWebhooks(shop: string, accessToken: string) {
  const session = shopify.session.customAppSession(shop);
  session.accessToken = accessToken;

  const webhooks = [
    {
      topic: 'orders/create',
      address: `${process.env.SHOPIFY_HOST}/api/webhooks/shopify/orders-create`,
    },
    {
      topic: 'orders/updated',
      address: `${process.env.SHOPIFY_HOST}/api/webhooks/shopify/orders-updated`,
    },
  ];

  for (const webhook of webhooks) {
    try {
      await shopify.webhooks.addHandlers({
        [webhook.topic]: [
          {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: webhook.address,
          },
        ],
      });
    } catch (error) {
      console.error(`Error registering webhook ${webhook.topic}:`, error);
    }
  }
}
