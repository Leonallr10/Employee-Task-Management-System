const TOKEN_KEY = "auth_token";
const REMEMBER_KEY = "auth_remember";

export function saveToken(token: string, rememberMe: boolean): void {
  clearToken();
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_KEY, "true");
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_KEY, "false");
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

export function wasRemembered(): boolean {
  return localStorage.getItem(REMEMBER_KEY) === "true";
}
