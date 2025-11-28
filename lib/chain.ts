import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
 * Schema for a GitHub repository summary.
 */
const repoSummarySchema = z.object({
  summary: z.string().describe("A concise summary of the GitHub repository, based on its README."),
  cool_facts: z.array(z.string()).describe("A list of interesting facts or highlights about the repository.")
});

/**
 * Creates a ChatOpenAI LLM instance with structured output support.
 * 
 * @param openAIApiKey - OpenAI API key (optional, can use OPENAI_API_KEY env var)
 * @returns ChatOpenAI instance configured for structured output
 */
export function createLLM(openAIApiKey?: string): ChatOpenAI {
  const apiKey = openAIApiKey || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it as a parameter.");
  }

  return new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
    openAIApiKey: apiKey,
  });
}

/**
 * Generates a chain that summarizes GitHub repository README content using a LangChain-compatible LLM.
 * The output is strictly validated against the schema: { summary: string, cool_facts: string[] }
 *
 * @param llm - A LangChain LLM instance (must support .withStructuredOutput)
 * @returns A chain that can be invoked with { readmeContent }
 */
export function createStrictReadmeSummaryChain(llm: BaseChatModel) {
  // Bind structured output directly to the model
  const structuredModel = llm.withStructuredOutput(repoSummarySchema, {
    name: "repo_summary",
    strict: true,
  });

  // Create the prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are an expert technical summarizer. Given the README content of a GitHub repository, summarize its purpose and functionality. Respond only with information taken from the README."],
    ["human", "Summarize this GitHub repository from this readme file content:\n{readmeContent}"],
  ]);

  // Create chain: prompt -> structured model
  const chain = prompt.pipe(structuredModel);

  return chain;
}

/**
 * Summarizes README content using LangChain and returns structured output.
 *
 * @param llm - A LangChain LLM instance (optional, will create one if not provided)
 * @param readmeContent - Content of the GitHub README file
 * @param openAIApiKey - OpenAI API key (optional, only used if llm is not provided)
 * @returns Promise<{ summary: string, cool_facts: string[] }>
 */
export async function summarizeReadmeWithLangChain(
  readmeContent: string,
  llm?: BaseChatModel,
  openAIApiKey?: string
): Promise<{ summary: string; cool_facts: string[] }> {
  // Use provided LLM or create a new one
  const model = llm || createLLM(openAIApiKey);
  const chain = createStrictReadmeSummaryChain(model);
  
  // Invoke the chain with the README content
  const result = await chain.invoke({ readmeContent });
  
  return result;
}

/**
 * Summarizes README content with error handling.
 * This is a higher-level function that wraps the summarization logic.
 *
 * @param readmeContent - Content of the GitHub README file
 * @param llm - A LangChain LLM instance (optional, will create one if not provided)
 * @param openAIApiKey - OpenAI API key (optional, only used if llm is not provided)
 * @returns Promise<{ summary: string, cool_facts: string[] }> or throws error
 */
export async function summarizeReadme(
  readmeContent: string,
  llm?: BaseChatModel,
  openAIApiKey?: string
): Promise<{ summary: string; cool_facts: string[] }> {
  try {
    return await summarizeReadmeWithLangChain(readmeContent, llm, openAIApiKey);
  } catch (error) {
    console.error("Error summarizing README:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    throw new Error(`Failed to summarize README: ${errorMessage}`);
  }
}

