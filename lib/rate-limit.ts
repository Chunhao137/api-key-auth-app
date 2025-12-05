import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export interface ApiKeyData {
  id: string;
  usage_count: number;
  monthly_limit: number | null;
  is_active: boolean;
}

export interface ValidationResult {
  success: boolean;
  error?: NextResponse;
  apiKeyData?: ApiKeyData;
}

export interface RateLimitResult {
  success: boolean;
  error?: NextResponse;
  apiKeyData?: ApiKeyData;
}

/**
 * Validates API key - checks if it exists, is active, and retrieves its data
 * Does NOT increment usage or check rate limits
 * 
 * @param apiKey - The API key to validate
 * @returns ValidationResult with success status, error response, or API key data
 */
export async function validateApiKey(apiKey: string): Promise<ValidationResult> {
  // Validate API key is provided
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return {
      success: false,
      error: NextResponse.json(
        { 
          error: "API key is required",
          message: "Please provide your API key via Authorization header (Bearer token), x-api-key header, or 'key' query parameter."
        },
        { status: 401 }
      ),
    };
  }

  // Validate API key against Supabase and get usage/limit info
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, is_active, usage_count, monthly_limit")
    .eq("key", apiKey.trim())
    .maybeSingle();

  // Check if there was a database error
  if (error) {
    console.error("Supabase error while validating API key:", error);
    return {
      success: false,
      error: NextResponse.json(
        { 
          error: "Authentication failed",
          message: "Unable to validate API key. Please try again later."
        },
        { status: 500 }
      ),
    };
  }

  // If no data is returned, the key doesn't exist
  if (!data) {
    return {
      success: false,
      error: NextResponse.json(
        { 
          error: "Invalid API key",
          message: "The provided API key does not exist. Please check your API key and try again."
        },
        { status: 401 }
      ),
    };
  }

  // Check if the key is active
  if (!data.is_active) {
    return {
      success: false,
      error: NextResponse.json(
        { 
          error: "API key is inactive",
          message: "This API key has been revoked or deactivated. Please use an active API key or contact support if you believe this is an error."
        },
        { status: 401 }
      ),
    };
  }

  // API key is valid - return success with API key data
  return {
    success: true,
    apiKeyData: {
      id: data.id,
      usage_count: data.usage_count,
      monthly_limit: data.monthly_limit,
      is_active: data.is_active,
    },
  };
}

/**
 * Increments API key usage and checks/enforces rate limits
 * Should be called after validateApiKey to ensure the API key is valid
 * 
 * @param apiKeyData - The validated API key data from validateApiKey
 * @returns RateLimitResult with success status, error response, or updated API key data
 */
export async function incrementUsageAndCheckLimit(
  apiKeyData: ApiKeyData
): Promise<RateLimitResult> {
  // Check rate limiting BEFORE incrementing: if monthly_limit is set and usage_count >= limit
  if (apiKeyData.monthly_limit !== null && apiKeyData.usage_count >= apiKeyData.monthly_limit) {
    return {
      success: false,
      error: NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You have reached your monthly limit of ${apiKeyData.monthly_limit} requests. Please upgrade your plan or wait for the next billing cycle to continue using the API.`,
          usage: apiKeyData.usage_count,
          limit: apiKeyData.monthly_limit,
        },
        { status: 429 }
      ),
    };
  }

  // Increment usage_count atomically and update last_used_at
  const { data: updatedKey, error: updateError } = await supabase
    .from("api_keys")
    .update({
      usage_count: (apiKeyData.usage_count || 0) + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", apiKeyData.id)
    .select("id, usage_count, monthly_limit, is_active")
    .single();

  if (updateError) {
    console.error("Error incrementing API key usage:", updateError);
    return {
      success: false,
      error: NextResponse.json(
        { 
          error: "Failed to update usage",
          message: "Unable to record API usage. Please try again later."
        },
        { status: 500 }
      ),
    };
  }

  // Double-check rate limit after incrementing (in case of race conditions)
  // This ensures we don't process requests that exceed the limit
  if (updatedKey.monthly_limit !== null && updatedKey.usage_count > updatedKey.monthly_limit) {
    return {
      success: false,
      error: NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You have exceeded your monthly limit of ${updatedKey.monthly_limit} requests. Please upgrade your plan or wait for the next billing cycle to continue using the API.`,
          usage: updatedKey.usage_count,
          limit: updatedKey.monthly_limit,
        },
        { status: 429 }
      ),
    };
  }

  // All checks passed - return success with updated API key data
  return {
    success: true,
    apiKeyData: {
      id: updatedKey.id,
      usage_count: updatedKey.usage_count,
      monthly_limit: updatedKey.monthly_limit,
      is_active: updatedKey.is_active,
    },
  };
}

/**
 * Convenience function that validates API key and increments usage in one call
 * Combines validateApiKey and incrementUsageAndCheckLimit for convenience
 * 
 * @param apiKey - The API key to validate and increment
 * @returns RateLimitResult with success status, error response, or API key data
 */
export async function checkRateLimit(apiKey: string): Promise<RateLimitResult> {
  // First validate the API key
  const validationResult = await validateApiKey(apiKey);
  
  if (!validationResult.success || !validationResult.apiKeyData) {
    return validationResult;
  }

  // Then increment usage and check limits
  return await incrementUsageAndCheckLimit(validationResult.apiKeyData);
}

/**
 * Extracts API key from request headers or query parameters
 * Supports Authorization header (Bearer token), x-api-key header, or 'key' query parameter
 * 
 * @param request - NextRequest object
 * @returns The API key string or null if not found
 */
export function extractApiKey(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("x-api-key");

  // Try to get API key from Authorization header (Bearer token format)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  } else if (apiKeyHeader) {
    return apiKeyHeader;
  } else {
    // Try to get from query parameter as fallback
    try {
      const url = new URL(request.url);
      return url.searchParams.get("key");
    } catch {
      return null;
    }
  }
}

