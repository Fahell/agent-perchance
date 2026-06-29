/**
 * Memory Extraction — persistent facts extracted from conversations.
 *
 * After each agent response, extracts 1-3 "timeless facts" using oc.generateText()
 * and stores them in oc.thread.customData. Memories survive page reloads.
 */

import type { Oc } from "./types.js";

// ─── Constants ──────────────────────────────────────────────
const MEMORIES_KEY = "agent:memories";
const MAX_MEMORIES = 20;
const MIN_CONTENT_LENGTH = 50; // Skip trivial exchanges

// ─── Memory Persistence ─────────────────────────────────────
export function getMemories(oc: Oc): string[] {
  const cd = oc.thread.customData as Record<string, unknown> | undefined;
  if (!cd) return [];
  const memories = cd[MEMORIES_KEY];
  if (!Array.isArray(memories)) return [];
  return memories.filter((m): m is string => typeof m === "string");
}

function saveMemories(oc: Oc, memories: string[]): void {
  if (!oc.thread.customData) oc.thread.customData = {};
  const cd = oc.thread.customData as Record<string, unknown>;
  // Cap at MAX_MEMORIES — evict oldest
  cd[MEMORIES_KEY] = memories.slice(-MAX_MEMORIES);
}

export function clearMemories(oc: Oc): void {
  const cd = oc.thread.customData as Record<string, unknown> | undefined;
  if (!cd) return;
  delete cd[MEMORIES_KEY];
}

export function deleteMemory(oc: Oc, index: number): void {
  const memories = getMemories(oc);
  if (index < 0 || index >= memories.length) return;
  memories.splice(index, 1);
  saveMemories(oc, memories);
}

// ─── Format for Context Injection ───────────────────────────
export function formatMemories(oc: Oc): string {
  const memories = getMemories(oc);
  if (memories.length === 0) return "";
  return memories.map((m) => `- ${m}`).join("\n");
}

// ─── Memory Extraction ──────────────────────────────────────
export async function extractMemories(
  oc: Oc,
  userMessage: string,
  agentResponse: string
): Promise<void> {
  // Skip trivial exchanges
  if (userMessage.length < MIN_CONTENT_LENGTH && agentResponse.length < MIN_CONTENT_LENGTH) {
    return;
  }

  // Check for existing memories to avoid duplicates
  const existing = getMemories(oc);
  const existingText = existing.join("\n");

  const instruction = `Extract 1-3 NEW facts from this conversation exchange that would be useful to remember in future conversations. Focus on:
- User preferences, goals, or requirements
- Important decisions or conclusions
- Key technical details or constraints
- Names, dates, or specific references

RULES:
- Each fact must be self-contained (no pronouns without antecedents)
- Use specific names and details, not vague references
- Only extract facts NOT already in the existing memories
- If there are no new noteworthy facts, respond with: NONE

Existing memories:
${existingText || "(none)"}

Conversation exchange:
User: ${userMessage}
Assistant: ${agentResponse.slice(0, 1000)}

New facts (one per line, or NONE):`;

  try {
    const response = await oc.generateText({ instruction });
    const text = response.toString().trim();

    // Check for no new facts
    if (text === "NONE" || text.includes("NONE") || text.length < 5) {
      console.log("🧠 [Memory] No new facts to extract");
      return;
    }

    // Parse facts (one per line)
    const newFacts = text
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter((line) => line.length > 10 && line !== "NONE");

    if (newFacts.length === 0) {
      console.log("🧠 [Memory] No valid facts extracted");
      return;
    }

    // Deduplicate against existing
    const unique = newFacts.filter(
      (fact) => !existing.some((e) => e.toLowerCase() === fact.toLowerCase())
    );

    if (unique.length === 0) {
      console.log("🧠 [Memory] All facts already exist");
      return;
    }

    // Append and save
    const updated = [...existing, ...unique];
    saveMemories(oc, updated);
    console.log("🧠 [Memory] Extracted", unique.length, "new fact(s). Total:", updated.length);
  } catch (err) {
    console.error("❌ [Memory] Extraction failed:", err);
  }
}
