export type CompanyLogoKind =
  | "missing"
  | "data-uri"
  | "absolute-url"
  | "upload-path"
  | "relative-web-path";

const UPLOADS_REQUEST_PATH = "/Uploads";

function trimSlashesEnd(value: string) {
  return value.replace(/\/+$/, "");
}

function trimSlashesStart(value: string) {
  return value.replace(/^\/+/, "");
}

export function getCompanyLogoKind(logoUrl: string | null | undefined): CompanyLogoKind {
  const raw = (logoUrl ?? "").trim();
  if (!raw) return "missing";

  if (/^data:/i.test(raw)) return "data-uri";
  if (/^blob:/i.test(raw)) return "absolute-url";
  if (/^https?:\/\//i.test(raw)) return "absolute-url";

  const normalized = trimSlashesStart(raw);
  const lower = normalized.toLowerCase();

  if (lower.startsWith("uploads/") || lower.startsWith("company/")) return "upload-path";
  if (!raw.includes("/")) return "upload-path";

  if (raw.startsWith("/")) return "relative-web-path";

  return "relative-web-path";
}

/**
 * Converts `logoUrl` into a browser-loadable `src`:
 * - Keeps `data:` URIs and absolute http(s) URLs
 */
export function resolveCompanyLogoSrc(logoUrl: string | null | undefined): string | undefined {
  const raw = (logoUrl ?? "").trim();
  if (!raw) return undefined;

  if (/^data:/i.test(raw)) return raw;
  if (/^blob:/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;

  const kind = getCompanyLogoKind(raw);
  if (kind !== "upload-path") {
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
  if (!apiBase) {
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  const base = trimSlashesEnd(apiBase);
  const normalized = trimSlashesStart(raw);
  const lower = normalized.toLowerCase();

  const path = lower.startsWith("uploads/")
    ? `/${normalized}`
    : `${UPLOADS_REQUEST_PATH}/${normalized}`;

  return `${base}${path}`;
}

