import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { summarizeReadme } from "@/lib/chain";

export async function POST(request: NextRequest) {
  try {
    // Get API key from request headers (Authorization header or x-api-key header)
    const authHeader = request.headers.get("authorization");
    const apiKeyHeader = request.headers.get("x-api-key");
    
    // Try to get API key from Authorization header (Bearer token format)
    let apiKey: string | null = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      apiKey = authHeader.substring(7);
    } else if (apiKeyHeader) {
      apiKey = apiKeyHeader;
    } else {
      // Try to get from query parameter as fallback
      const { searchParams } = new URL(request.url);
      apiKey = searchParams.get("key");
    }

    // Validate API key is provided
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required. Provide it via Authorization header (Bearer token), x-api-key header, or 'key' query parameter." },
        { status: 401 }
      );
    }

    // Validate API key against Supabase
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, is_active")
      .eq("key", apiKey)
      .maybeSingle();

    // Check if there was an error or if the key doesn't exist
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // If no data is returned, the key doesn't exist
    if (!data) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Check if the key is active
    if (!data.is_active) {
      return NextResponse.json(
        { error: "API key is not active" },
        { status: 401 }
      );
    }

    // API key is valid - proceed with the request
    const body = await request.json().catch(() => ({}));

    // Accept 'githubUrl' (same as 'repoUrl'), or 'repo' field
    const repoInput: string | undefined = body.githubUrl || body.repoUrl || body.repo;

    // Validate repo input is provided
    if (!repoInput || typeof repoInput !== "string") {
      return NextResponse.json(
        { error: "githubUrl (or repoUrl) or repo is required in request body" },
        { status: 400 }
      );
    }

    // Fetch README content from GitHub
    const readmeContent: string | null = await fetchReadmeFromGitHub(repoInput);

    
    if (!readmeContent) {
      return NextResponse.json(
        { error: "README not found" },
        { status: 404 }
      );
    }

    // Summarize README using LangChain
    try {
      const summary = await summarizeReadme(readmeContent);
      
      return NextResponse.json({
        summary: summary.summary,
        cool_facts: summary.cool_facts,
      });
    } catch (summaryError) {
      const errorMessage = summaryError instanceof Error ? summaryError.message : String(summaryError);
      return NextResponse.json(
        { 
          error: "Failed to summarize README. Please try again later.",
          details: process.env.NODE_ENV === "development" ? errorMessage : undefined
        },
        { status: 500 }
      );
    }

  } catch (err) {
    console.error("Error in github-summarizer endpoint:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support GET requests if needed
export async function GET(request: NextRequest) {
  try {
    // Get API key from request headers or query params
    const authHeader = request.headers.get("authorization");
    const apiKeyHeader = request.headers.get("x-api-key");
    
    let apiKey: string | null = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      apiKey = authHeader.substring(7);
    } else if (apiKeyHeader) {
      apiKey = apiKeyHeader;
    } else {
      const { searchParams } = new URL(request.url);
      apiKey = searchParams.get("key");
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required. Provide it via Authorization header (Bearer token), x-api-key header, or 'key' query parameter." },
        { status: 401 }
      );
    }

    // Validate API key
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, is_active")
      .eq("key", apiKey)
      .maybeSingle();

    if (error || !data || !data.is_active) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // API key is valid
    const { searchParams } = new URL(request.url);
    
    // Example response - replace with your actual implementation
    return NextResponse.json({
      message: "API key validated successfully",
      // Add your github-summarizer response here
    });

  } catch (err) {
    console.error("Error in github-summarizer endpoint:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Fetches the README.md content from a given GitHub repository URL.
 * Supports both full URLs and "owner/repo" format.
 * Returns the README content as a string, or null if not found.
 *
 * @param repoUrl - The GitHub repository URL or "owner/repo" string
 */
async function fetchReadmeFromGitHub(repoUrl: string): Promise<string | null> {
  // Normalize input: handle full URL or "owner/repo"
  let owner: string | null = null;
  let repo: string | null = null;

  try {
    if (repoUrl.includes("github.com")) {
      // Full GitHub URL
      const match = repoUrl.match(
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/
      );
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, ""); // Remove .git if present
      }
    } else if (repoUrl.includes("/")) {
      // "owner/repo" format
      const split = repoUrl.split("/");
      owner = split[0];
      repo = split[1].replace(/\.git$/, "");
    }

    if (!owner || !repo) return null;

    // GitHub API endpoint for repo README
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3.raw", // Ask for raw content
      },
    });

    if (response.status === 200) {
      // Get plain README text (raw)
      return await response.text();
    } else {
      // README not found or repo missing
      return null;
    }
  } catch (e) {
    // Network error, invalid repo, rate limited, etc.
    return null;
  }
}

