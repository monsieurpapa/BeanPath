/**
 * Standalone production server for BeanPath.
 *
 * Routing logic:
 *   Browser request (no expo-platform header):
 *     GET /              → serves dist/index.html  (Expo web build = full React app)
 *     GET /assets/...    → serves dist/assets/...
 *     GET /_expo/...     → serves dist/_expo/...
 *     GET /*             → tries dist/<path>, falls back to dist/index.html (SPA)
 *
 *   Expo Go / native request (expo-platform: ios | android):
 *     GET / or /manifest → serves static-build/<platform>/manifest.json
 *     GET /**            → serves static-build/<path>
 *
 * Zero external dependencies — Node.js built-ins only.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT  = path.resolve(__dirname, "..");
const DIST_DIR      = path.resolve(PROJECT_ROOT, "dist");          // expo export web output
const STATIC_ROOT   = path.resolve(PROJECT_ROOT, "static-build");  // native bundles
const basePath      = (process.env.BASE_PATH || "/").replace(/\/+$/, "");

const MIME_TYPES = {
  ".html":  "text/html; charset=utf-8",
  ".js":    "application/javascript; charset=utf-8",
  ".mjs":   "application/javascript; charset=utf-8",
  ".json":  "application/json; charset=utf-8",
  ".css":   "text/css; charset=utf-8",
  ".png":   "image/png",
  ".jpg":   "image/jpeg",
  ".jpeg":  "image/jpeg",
  ".gif":   "image/gif",
  ".svg":   "image/svg+xml",
  ".ico":   "image/x-icon",
  ".webp":  "image/webp",
  ".woff":  "font/woff",
  ".woff2": "font/woff2",
  ".ttf":   "font/ttf",
  ".otf":   "font/otf",
  ".map":   "application/json",
};

function mime(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

// ── Native manifest ──────────────────────────────────────────────────────────

function serveManifest(platform, res) {
  const manifestPath = path.join(STATIC_ROOT, platform, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: `Manifest not found for platform: ${platform}` }));
    return;
  }
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.writeHead(200, {
    "content-type": "application/json",
    "expo-protocol-version": "1",
    "expo-sfv-version": "0",
  });
  res.end(manifest);
}

// ── Static file helper ───────────────────────────────────────────────────────

function serveFile(filePath, res) {
  const content = fs.readFileSync(filePath);
  res.writeHead(200, {
    "content-type": mime(filePath),
    // aggressive cache for hashed assets, no-cache for HTML
    "cache-control": filePath.endsWith(".html")
      ? "no-cache, no-store, must-revalidate"
      : "public, max-age=31536000, immutable",
  });
  res.end(content);
}

// ── Web (browser) requests ───────────────────────────────────────────────────

const webIndexPath = path.join(DIST_DIR, "index.html");
const hasWebBuild  = fs.existsSync(webIndexPath);

if (!hasWebBuild) {
  console.warn(
    "WARNING: dist/index.html not found. Browser visitors will see a 503 error.\n" +
    "Make sure the build step ran `expo export --platform web`.",
  );
}

function serveWebApp(pathname, res) {
  if (!hasWebBuild) {
    res.writeHead(503, { "content-type": "text/plain" });
    res.end("Web build not available. Please redeploy.");
    return;
  }

  // Strip leading slash, resolve inside dist/
  const rel      = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const safe     = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(DIST_DIR, safe);

  // Security: must stay inside dist
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
    serveFile(filePath, res);
  } else {
    // SPA fallback — let Expo Router handle client-side routing
    serveFile(webIndexPath, res);
  }
}

// ── Native static assets ─────────────────────────────────────────────────────

function serveNativeStatic(pathname, res) {
  const safe     = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(STATIC_ROOT, safe);

  if (!filePath.startsWith(STATIC_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  serveFile(filePath, res);
}

// ── Server ───────────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url      = new URL(req.url || "/", `http://${req.headers.host}`);
  let   pathname = url.pathname;

  // Strip base path prefix
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  const expoPlatform = req.headers["expo-platform"];

  // ── Native Expo Go client ──
  if (expoPlatform === "ios" || expoPlatform === "android") {
    if (pathname === "/" || pathname === "/manifest") {
      return serveManifest(expoPlatform, res);
    }
    return serveNativeStatic(pathname, res);
  }

  // ── Health check (used by artifact.toml ensurePreviewReachable) ──
  if (pathname === "/status") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }

  // ── Browser — serve Expo web build ──
  serveWebApp(pathname, res);
});

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`BeanPath production server on port ${port}`);
  console.log(`Web build: ${hasWebBuild ? "✓ dist/ found" : "✗ MISSING — browser visits will 503"}`);
  console.log(`Native build: ${fs.existsSync(STATIC_ROOT) ? "✓ static-build/ found" : "✗ not built"}`);
});
