import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

/**
 * Get the authenticated user's Supabase user ID from the session
 * @returns User ID from Supabase or null if not authenticated
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  // Get user from Supabase by email
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user from Supabase:", error);
    return null;
  }

  return data?.id || null;
}

