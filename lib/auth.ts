import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Get user details from Supabase database
 * @param email - User's email address
 * @returns User record from Supabase or null if not found
 */
export async function getUserFromSupabase(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user from Supabase:", error);
    return null;
  }

  return data;
}

