// src/utils/oauth.ts

const API_BASE_URL = 'http://localhost:3000/api/v1';

export const oauthHelpers = {
  // Google OAuth
  loginWithGoogle: () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  // Facebook OAuth
  loginWithFacebook: () => {
    // Redirect to backend Facebook OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/facebook`;
  },

  // Check for OAuth errors in URL (after redirect back)
  checkOAuthError: (): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get('error');
  },

  // Clear OAuth error from URL
  clearOAuthError: () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    window.history.replaceState({}, '', url.toString());
  }
};