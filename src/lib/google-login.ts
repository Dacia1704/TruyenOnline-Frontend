declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export async function initGoogleScript(): Promise<void> {
  if (!GOOGLE_CLIENT_ID) return;
  if (document.getElementById("google-identity-services")) return;

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export async function triggerGoogleLogin(): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google Client ID not configured");
  }

  await initGoogleScript();

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: { credential: string }) => {
            resolve(response.credential);
          },
        });
        window.google.accounts.id.prompt();
      } else {
        resolve(null);
      }
    }, 1000);

    // Timeout fallback
    setTimeout(() => {
      clearTimeout(timeoutId);
      resolve(null);
    }, 30000);
  });
}
