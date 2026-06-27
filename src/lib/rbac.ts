import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT" | "RECEPTIONIST";

/**
 * Get the current authenticated session, or return a 401 response.
 */
export async function getSessionOrUnauthorized() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

/**
 * Check if a role can perform a given action.
 *
 * Permissions:
 *  - ADMIN: read, write, delete (full access)
 *  - DOCTOR: read, write only (no delete)
 *  - PATIENT: read, write only (no delete)
 *  - RECEPTIONIST: read, write only (no delete)
 */
export function canPerform(role: string, action: "read" | "write" | "delete"): boolean {
  if (role === "ADMIN") return true;
  if (action === "delete") return false;
  return ["DOCTOR", "PATIENT", "RECEPTIONIST"].includes(role);
}

/**
 * Returns a 403 Forbidden response.
 */
export function forbidden(message = "Forbidden: insufficient permissions") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Require the user to be authenticated AND have one of the allowed roles.
 * Returns { session, error } — if error is non-null, return it from your route handler.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const { session, error } = await getSessionOrUnauthorized();
  if (error) return { session: null, error };
  const role = session!.user.role as UserRole;
  if (!allowedRoles.includes(role)) {
    return { session: null, error: forbidden() };
  }
  return { session, error: null };
}

/**
 * Require the user to be authenticated (any role).
 */
export async function requireAuth() {
  return getSessionOrUnauthorized();
}
