import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SubscriptionTier } from '@/types';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const merchant = await prisma.merchant.findUnique({
          where: { email: credentials.email },
        });

        if (!merchant) {
          return null;
        }

        // Verify password if merchant has one set
        if (merchant.password) {
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            merchant.password
          );

          if (!isValidPassword) {
            return null;
          }
        } else {
          // For merchants created via Shopify OAuth without a password
          // They should use the Shopify OAuth flow instead
          return null;
        }

        return {
          id: merchant.id,
          email: merchant.email,
          subscriptionTier: merchant.subscriptionTier as SubscriptionTier,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.subscriptionTier = (user as any).subscriptionTier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).subscriptionTier = token.subscriptionTier;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
