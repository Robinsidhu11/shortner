import crypto from "crypto";
import { getDb } from "./mongodb";
import type { ShortUrl } from "./shortener";

interface ClickEvent {
  shortCode: string;
  createdAt: Date;
  ipHash: string;
  userAgent?: string;
}

export interface LinkWithStats {
  shortCode: string;
  targetUrl: string;
  createdAt: Date;
  totalHits: number;
  uniqueHits: number;
}

export interface OverallStats {
  totalLinks: number;
  totalHits: number;
  uniqueHits: number;
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "change-me-in-production";
  return crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

export async function recordClickForCode(
  shortCode: string,
  ip: string | null,
  userAgent: string | null
): Promise<void> {
  const db = await getDb();
  const clicks = db.collection<ClickEvent>("clicks");

  const safeIp = ip && ip.trim() ? ip.trim() : "unknown";
  const ipHash = hashIp(safeIp);

  const event: ClickEvent = {
    shortCode,
    createdAt: new Date(),
    ipHash,
    userAgent: userAgent ?? undefined
  };

  await clicks.insertOne(event);
}

export async function getLinksWithStats(): Promise<{
  links: LinkWithStats[];
  overall: OverallStats;
}> {
  const db = await getDb();

  const shortUrls = await db
    .collection<ShortUrl>("short_urls")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const clicks = db.collection<ClickEvent>("clicks");

  const aggregates = await clicks
    .aggregate<{
      _id: string;
      totalHits: number;
      uniqueHits: number;
    }>([
      {
        $group: {
          _id: { shortCode: "$shortCode", ipHash: "$ipHash" },
          hits: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.shortCode",
          totalHits: { $sum: "$hits" },
          uniqueHits: { $sum: 1 }
        }
      }
    ])
    .toArray();

  const statsByCode = new Map<
    string,
    { totalHits: number; uniqueHits: number }
  >();

  for (const row of aggregates) {
    statsByCode.set(row._id, {
      totalHits: row.totalHits ?? 0,
      uniqueHits: row.uniqueHits ?? 0
    });
  }

  let overallTotalHits = 0;
  let overallUniqueHits = 0;

  const links: LinkWithStats[] = shortUrls.map((link) => {
    const stats = statsByCode.get(link.shortCode) ?? {
      totalHits: 0,
      uniqueHits: 0
    };

    overallTotalHits += stats.totalHits;
    overallUniqueHits += stats.uniqueHits;

    return {
      shortCode: link.shortCode,
      targetUrl: link.targetUrl,
      createdAt: link.createdAt,
      totalHits: stats.totalHits,
      uniqueHits: stats.uniqueHits
    };
  });

  const overall: OverallStats = {
    totalLinks: links.length,
    totalHits: overallTotalHits,
    uniqueHits: overallUniqueHits
  };

  return { links, overall };
}

