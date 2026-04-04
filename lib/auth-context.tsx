// Re-export from canonical location — hooks/use-auth.tsx
// This shim exists for backward compatibility. New code should import from @/hooks/use-auth.
export { AuthProvider, useAuth } from "@/hooks/use-auth";
export type { AuthContextValue } from "@/hooks/use-auth";
