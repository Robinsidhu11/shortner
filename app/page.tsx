"use client";

import { FormEvent, useState } from "react";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setShortUrl(null);

    if (!url.trim()) {
      setError("Please paste a URL.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to shorten URL.");
        return;
      }

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const fullShortUrl = origin && data.shortCode
        ? `${origin}/${data.shortCode}`
        : data.shortCode;

      setShortUrl(fullShortUrl);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!shortUrl) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shortUrl).catch(() => {
        // ignore copy errors
      });
    }
  }

  return (
    <main className="page-root">
      <div className="card">
        <h1 className="title">Minimal URL Shortener</h1>
        <p className="subtitle">
          Paste a long link, get a clean short link you can use anywhere.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="url"
            placeholder="https://your-long-link.com/..."
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="input"
          />
          <button
            type="submit"
            className="button"
            disabled={loading}
          >
            {loading ? "Shortening..." : "Shorten"}
          </button>
        </form>

        {error && <p className="message error">{error}</p>}

        {shortUrl && (
          <div className="result">
            <span className="short-url">{shortUrl}</span>
            <button
              type="button"
              className="copy-button"
              onClick={handleCopy}
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

