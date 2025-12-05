import { NextRequest, NextResponse } from "next/server";
import { summarizeReadme } from "@/lib/chain";
import { extractApiKey, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Extract API key from request
    const apiKey = extractApiKey(request);

    // Check rate limit and validate API key
    const rateLimitResult = await checkRateLimit(apiKey || "");
    
    if (!rateLimitResult.success) {
      return rateLimitResult.error!;
    }

    // API key is valid - proceed with the request
    let body: any = {};
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

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
    // Extract API key from request
    const apiKey = extractApiKey(request);

    // Check rate limit and validate API key
    const rateLimitResult = await checkRateLimit(apiKey || "");
    
    if (!rateLimitResult.success) {
      return rateLimitResult.error!;
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

