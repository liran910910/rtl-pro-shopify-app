import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function ExitIframe() {
    const [searchParams] = useSearchParams();
    const redirectUri = searchParams.get("redirectUri");

  useEffect(() => {
        if (redirectUri) {
                // Redirect the top-level window to the auth URL
          window.open(redirectUri, "_top");
        }
  }, [redirectUri]);

  return null;
}
