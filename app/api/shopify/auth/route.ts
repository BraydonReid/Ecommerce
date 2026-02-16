import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import shopify from '@/lib/shopify';

/**
 * Initiate Shopify OAuth flow
 * GET /api/shopify/auth?shop=myshop.myshopify.com
 */
export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  try {
    const sanitizedShop = shopify.utils.sanitizeShop(shop, true);

    if (!sanitizedShop) {
      return NextResponse.json({ error: 'Invalid shop domain' }, { status: 400 });
    }

    // Generate cryptographically secure state parameter
    const state = crypto.randomBytes(16).toString('hex');
    const redirectUri = `${process.env.SHOPIFY_HOST}/api/shopify/callback`;
    const scopes = process.env.SHOPIFY_SCOPES || 'read_orders,read_products,read_shipping';

    const authUrl = `https://${sanitizedShop}/admin/oauth/authorize?` +
      `client_id=${process.env.SHOPIFY_API_KEY}&` +
      `scope=${scopes}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}`;

    // Store state in HTTP-only cookie for validation in callback
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('shopify_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error starting Shopify OAuth:', error);
    return NextResponse.json({ error: 'Failed to start OAuth' }, { status: 500 });
  }
}
