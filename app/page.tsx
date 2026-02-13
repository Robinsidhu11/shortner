"use client";

import { FormEvent, useEffect, useState } from "react";

type LinkWithStats = {
  shortCode: string;
  targetUrl: string;
  createdAt: string;
  totalHits: number;
  uniqueHits: number;
};

type OverallStats = {
  totalLinks: number;
  totalHits: number;
  uniqueHits: number;
};

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<LinkWithStats[]>([]);
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<LinkWithStats | null>(null);

  async function loadStats() {
    try {
      setStatsError(null);
      const response = await fetch("/api/links");
      if (!response.ok) {
        setStatsError("Failed to load link statistics.");
        return;
      }
      const data = await response.json();
      setLinks(data.links ?? []);
      setOverall(data.overall ?? null);
    } catch {
      setStatsError("Failed to load link statistics.");
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

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
      const fullShortUrl =
        origin && data.shortCode ? `${origin}/${data.shortCode}` : data.shortCode;

      setShortUrl(fullShortUrl);

      // Refresh stats so the new link appears in the list.
      loadStats();
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
      <div className="card card-main">
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

      <div className="card card-stats">
        <h2 className="section-title">Analytics</h2>

        {overall && (
          <div className="overall-stats">
            <div className="stat">
              <span className="stat-label">Total links</span>
              <span className="stat-value">{overall.totalLinks}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total hits</span>
              <span className="stat-value">{overall.totalHits}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Unique hits</span>
              <span className="stat-value">{overall.uniqueHits}</span>
            </div>
          </div>
        )}

        {statsError && <p className="message error">{statsError}</p>}

        {links.length > 0 ? (
          <ul className="links-list">
            {links.map((link) => {
              const origin =
                typeof window !== "undefined"
                  ? window.location.origin
                  : "";
              const fullShort =
                origin && link.shortCode
                  ? `${origin}/${link.shortCode}`
                  : `/${link.shortCode}`;

              return (
                <li
                  key={link.shortCode}
                  className={`links-list-item${
                    selectedLink?.shortCode === link.shortCode
                      ? " links-list-item-selected"
                      : ""
                  }`}
                  onClick={() => setSelectedLink(link)}
                >
                  <div className="links-list-main">
                    <span className="links-list-short">{fullShort}</span>
                    <span className="links-list-target">
                      {link.targetUrl}
                    </span>
                  </div>
                  <div className="links-list-metrics">
                    <span>{link.totalHits} hits</span>
                    <span>{link.uniqueHits} unique</span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="message">
            Shorten a link to start seeing analytics here.
          </p>
        )}

        {selectedLink && (
          <div className="selected-link-panel">
            <h3 className="section-subtitle">Selected link</h3>
            <p className="selected-short">
              <strong>Short:</strong> /{selectedLink.shortCode}
            </p>
            <p className="selected-target">
              <strong>Target:</strong> {selectedLink.targetUrl}
            </p>
            <p className="selected-metrics">
              <strong>Hits:</strong> {selectedLink.totalHits} total,{" "}
              {selectedLink.uniqueHits} unique
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

