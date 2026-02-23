import { useState, useCallback } from "react";

const BASE_URL = "/api";

async function getSessionToken() {
  if (window.shopify && typeof window.shopify.idToken === "function") {
    try {
      // Add timeout to prevent hanging if idToken() never resolves
      const tokenPromise = window.shopify.idToken();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Session token timeout after 3s")), 3000)
      );
      return await Promise.race([tokenPromise, timeoutPromise]);
    } catch (e) {
      console.warn("Failed to get session token:", e);
      return null;
    }
  }
  return null;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (path, options = {}) => {
    setLoading(true);
    setError(null);
    const token = await getSessionToken();
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((path) => request(path), [request]);
  const post = useCallback(
    (path, body) =>
      request(path, { method: "POST", body: JSON.stringify(body) }),
    [request]
  );
  const put = useCallback(
    (path, body) =>
      request(path, { method: "PUT", body: JSON.stringify(body) }),
    [request]
  );
  const del = useCallback((path) => request(path, { method: "DELETE" }), [
    request,
  ]);

  return { get, post, put, del, loading, error };
}
