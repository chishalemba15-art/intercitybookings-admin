/**
 * Shared in-memory storage for agent PINs
 *
 * NOTE: This is a temporary solution for development.
 * In production, PINs should be:
 * 1. Hashed using bcrypt or similar
 * 2. Stored in the database
 * 3. Never stored in plain text
 */

// In-memory PIN storage (shared across both login and set-pin routes)
export const agentPINs = new Map<number, string>();

// Default test PINs for development
agentPINs.set(10, '1234'); // Agent 10 (Test Agent)
agentPINs.set(11, '1234'); // Agent 11
agentPINs.set(12, '1234'); // Agent 12
