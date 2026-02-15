import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

/**
 * Set Shopify access token manually (admin only)
 * POST /api/admin/set-token
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the user is logged in and is an admin
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { id: token.id as string },
    });

    if (!merchant || !merchant.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { accessToken, shopDomain } = body;

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    // Update the merchant with the access token and optionally the shop domain
    const updateData: { shopifyAccessToken: string; shopifyShop?: string } = {
      shopifyAccessToken: accessToken,
    };

    if (shopDomain) {
      updateData.shopifyShop = shopDomain;
    }

    await prisma.merchant.update({
      where: { id: merchant.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Access token saved successfully',
      shopifyShop: shopDomain || merchant.shopifyShop,
    });
  } catch (error) {
    console.error('Error setting token:', error);
    return NextResponse.json(
      { error: 'Failed to save token' },
      { status: 500 }
    );
  }
}
