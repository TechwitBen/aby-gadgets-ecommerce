// src/utils/oauth.ts

const API_BASE_URL = import.meta.env.VITE_API_URL ?? `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

export const oauthHelpers = {
  // ── Google OAuth ────────────────────────────────────────────────────────────
  loginWithGoogle: (redirectTo?: string) => {
    const params = redirectTo && redirectTo !== "/"
      ? `?redirect=${encodeURIComponent(redirectTo)}`
      : "";
    window.location.href = `${API_BASE_URL}/auth/google${params}`;
  },

  // ── Facebook OAuth ──────────────────────────────────────────────────────────
  loginWithFacebook: (redirectTo?: string) => {
    const params = redirectTo && redirectTo !== "/"
      ? `?redirect=${encodeURIComponent(redirectTo)}`
      : "";
    window.location.href = `${API_BASE_URL}/auth/facebook${params}`;
  },

  // ── Check for OAuth errors in URL (after redirect back) ────────────────────
  // Returns "google" | "facebook" | null
  checkOAuthError: (): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get("error");
  },

  // ── Clear OAuth error from URL without a page reload ───────────────────────
  clearOAuthError: () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.toString());
  },
};