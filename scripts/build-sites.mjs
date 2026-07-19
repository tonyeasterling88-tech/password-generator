import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const client = join(dist, "client");

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "server"), { recursive: true });
await cp(join(root, "index.html"), join(client, "index.html"), { recursive: false });
await cp(join(root, "styles.css"), join(client, "styles.css"), { recursive: false });
await cp(join(root, "script.js"), join(client, "script.js"), { recursive: false });
await cp(join(root, "icons"), join(client, "icons"), { recursive: true });

const worker = `function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== "GET") return withSecurityHeaders(response);

    const acceptsHtml = (request.headers.get("Accept") || "").includes("text/html");
    const fallback = acceptsHtml
      ? env.ASSETS.fetch(new Request(new URL("/", request.url), request))
      : response;
    return withSecurityHeaders(await fallback);
  },
};
`;

await writeFile(join(dist, "server", "index.js"), worker);
console.log("Sites build ready");
