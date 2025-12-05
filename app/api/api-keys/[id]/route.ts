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
 * GET /api/api-keys/[id]
 * Get a specific API key by ID for the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Fetch API key for this user
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching API key:", error);
      return NextResponse.json(
        { error: "Failed to fetch API key" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error in GET /api/api-keys/[id]:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/api-keys/[id]
 * Update a specific API key by ID for the authenticated user
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    // Verify the API key belongs to this user
    const { data: existingKey, error: fetchError } = await supabase
      .from("api_keys")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching API key:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch API key" },
        { status: 500 }
      );
    }

    if (!existingKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.keyType !== undefined) {
      if (!["dev", "prod"].includes(body.keyType)) {
        return NextResponse.json(
          { error: "keyType must be 'dev' or 'prod'" },
          { status: 400 }
        );
      }
      updateData.key_type = body.keyType;
    }

    if (body.monthlyLimit !== undefined) {
      updateData.monthly_limit = body.monthlyLimit === null ? null : Number(body.monthlyLimit);
    }

    if (body.isActive !== undefined) {
      updateData.is_active = Boolean(body.isActive);
    }

    // Handle key rotation
    if (body.rotate === true) {
      updateData.key = generateKey();
      updateData.last_used_at = new Date().toISOString();
      updateData.is_active = true;
    }

    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update API key
    const { data, error } = await supabase
      .from("api_keys")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating API key:", error);
      return NextResponse.json(
        { error: "Failed to update API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error in PATCH /api/api-keys/[id]:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/api-keys/[id]
 * Delete a specific API key by ID for the authenticated user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verify the API key belongs to this user
    const { data: existingKey, error: fetchError } = await supabase
      .from("api_keys")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching API key:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch API key" },
        { status: 500 }
      );
    }

    if (!existingKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    // Delete API key
    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting API key:", error);
      return NextResponse.json(
        { error: "Failed to delete API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "API key deleted successfully" });
  } catch (err) {
    console.error("Error in DELETE /api/api-keys/[id]:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

