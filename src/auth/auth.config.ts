import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ALL_PERMISSIONS } from '@/lib/constants';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials.username as string;
        const password = credentials.password as string;

        if (!username || !password) return null;

        const user = db.prepare(
          'SELECT id, username, password_hash, nickname, role, permissions, is_active FROM users WHERE username = ?'
        ).get(username) as Record<string, unknown> | undefined;

        if (!user || !user.is_active) return null;

        const isValid = await compare(password, user.password_hash as string);
        if (!isValid) return null;

        return {
          id: String(user.id),
          name: (user.nickname as string) || (user.username as string),
          username: user.username as string,
          role: user.role as string,
          permissions: user.role === 'admin'
            ? ALL_PERMISSIONS
            : JSON.parse((user.permissions as string) || '[]'),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
        token.username = (user as any).username;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});
