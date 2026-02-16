import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * Get the authenticated merchant from the current session.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedMerchant() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  const userId = (session.user as any).id;
  return prisma.merchant.findUnique({
    where: { id: userId },
    include: { settings: true },
  });
}
