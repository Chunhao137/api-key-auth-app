import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/api-helpers";

// Generate a new API key
const generateKey = () =>
  `sk_${Math.random().toString(36).slice(2, 10)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;

/**
 * GET /api/api-keys
 * Get all API keys for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user ID from Supabase
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch API keys for this user
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching API keys:", error);
      return NextResponse.json(
        { error: "Failed to fetch API keys" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("Error in GET /api/api-keys:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/api-keys
 * Create a new API key for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user ID from Supabase
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, keyType, monthlyLimit } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Validate keyType
    if (keyType && !["dev", "prod"].includes(keyType)) {
      return NextResponse.json(
        { error: "keyType must be 'dev' or 'prod'" },
        { status: 400 }
      );
    }

    // Generate new API key
    const newKey = generateKey();

    // Create API key in Supabase
    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: userId,
        name: name.trim(),
        key: newKey,
        key_type: keyType || "dev",
        monthly_limit: monthlyLimit || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating API key:", error);
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/api-keys:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

