function withSecurityHeaders(response) {
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
