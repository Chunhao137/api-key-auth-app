import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email || !account?.providerAccountId) {
        return false;
      }

      try {
        // Check if user already exists in Supabase
        const { data: existingUser, error: queryError } = await supabase
          .from("users")
          .select("id, email")
          .eq("email", user.email)
          .maybeSingle();

        if (queryError) {
          console.error("Error querying user from Supabase:", queryError);
          // If table doesn't exist, log it but don't block login
          if (queryError.code === "42P01" || queryError.message?.includes("does not exist")) {
            console.error("Users table does not exist. Please run the migration: supabase-migration-users-table.sql");
          }
          // Don't block login if query fails
          return true;
        }

        let supabaseUserId: string | null = null;

        if (!existingUser) {
          // User doesn't exist, create new user record
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              provider: account.provider,
              provider_id: account.providerAccountId,
              last_login_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (insertError) {
            console.error("Error creating user in Supabase:", insertError);
            // Don't block login if database insert fails
            // You might want to handle this differently in production
          } else if (newUser) {
            supabaseUserId = newUser.id;
          }
        } else {
          // User exists, update last_login_at
          supabaseUserId = existingUser.id;
          const { error: updateError } = await supabase
            .from("users")
            .update({ last_login_at: new Date().toISOString() })
            .eq("email", user.email);

          if (updateError) {
            console.error("Error updating user login time:", updateError);
          }
        }

        // Store Supabase user ID in the user object for use in JWT callback
        if (supabaseUserId) {
          user.id = supabaseUserId;
        }
      } catch (error) {
        console.error("Error in signIn callback:", error);
        // Don't block login if there's an error
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // Use Supabase user ID if available, otherwise fall back to NextAuth token sub
        session.user.id = (token.supabaseUserId as string) || (token.sub as string);
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Store Supabase user ID in token if available
        if (user.id) {
          token.supabaseUserId = user.id;
        }
        token.sub = user.id || token.sub;
      }
      if (account) {
        token.providerAccountId = account.providerAccountId;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("Missing Google OAuth credentials");
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error("Missing NEXTAUTH_SECRET");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

