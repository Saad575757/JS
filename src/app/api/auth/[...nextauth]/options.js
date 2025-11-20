import CredentialsProvider from 'next-auth/providers/credentials';
import { randomBytes } from 'crypto';

// Xytek API base URL
const XYTEK_API_URL = 'https://class.xytek.ai/api';

export const options = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email:',
          type: 'text',
          placeholder: 'Enter your email'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
      },
      async authorize(credentials, req) {
        try {
          // Call Xytek API for authentication
          const response = await fetch(`${XYTEK_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success && data.user) {
            // Return user object with token
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              picture: data.user.picture,
              token: data.token, // Store the JWT token
            };
          } else {
            throw new Error(data.message || 'Email or Password is not valid');
          }
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Authentication failed. Please try again.');
        }
      }
    })
  ],
  secret: 'kvwLrfri/MBznUCofIoRH9+NvGu6GqvVdqO3mor1GuA=',
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.picture = user.picture;
        token.accessToken = user.token; // Store Xytek JWT token
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          picture: token.picture,
        };
        session.accessToken = token.accessToken; // Include access token in session
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
};
