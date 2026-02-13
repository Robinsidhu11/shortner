import { customAlphabet } from "nanoid";
import { getDb } from "./mongodb";

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CODE_LENGTH = 7;

const nanoid = customAlphabet(ALPHABET, CODE_LENGTH);

export interface ShortUrl {
  _id?: unknown;
  shortCode: string;
  targetUrl: string;
  createdAt: Date;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new Error("EMPTY_URL");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    // eslint-disable-next-line no-new
    new URL(withProtocol);
  } catch {
    throw new Error("INVALID_URL");
  }

  return withProtocol;
}

export async function createShortUrl(rawUrl: string): Promise<ShortUrl> {
  const db = await getDb();
  const collection = db.collection<ShortUrl>("short_urls");

  await collection.createIndex({ shortCode: 1 }, { unique: true });

  const targetUrl = normalizeUrl(rawUrl);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shortCode = nanoid();
    const doc: ShortUrl = {
      shortCode,
      targetUrl,
      createdAt: new Date()
    };

    try {
      await collection.insertOne(doc);
      return doc;
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        // @ts-expect-error mongodb error code
        err.code === 11000
      ) {
        continue;
      }
      throw err;
    }
  }

  throw new Error("FAILED_TO_GENERATE_SHORT_CODE");
}

export async function resolveShortCode(
  shortCode: string
): Promise<ShortUrl | null> {
  const db = await getDb();
  const collection = db.collection<ShortUrl>("short_urls");
  return collection.findOne({ shortCode });
}

