import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

interface SitemapEntry { path: string; changefreq?: "weekly" | "monthly"; priority?: string }

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/personas", changefreq: "monthly", priority: "0.8" },
          { path: "/architecture", changefreq: "monthly", priority: "0.7" },
          { path: "/docs", changefreq: "monthly", priority: "0.7" },
          { path: "/agents/yield", changefreq: "monthly", priority: "0.6" },
          { path: "/agents/rwa", changefreq: "monthly", priority: "0.6" },
          { path: "/agents/dao", changefreq: "monthly", priority: "0.6" },
          { path: "/agents/compliance", changefreq: "monthly", priority: "0.6" },
          { path: "/signup", changefreq: "monthly", priority: "0.5" },
          { path: "/login", changefreq: "monthly", priority: "0.5" },
        ];
        const urls = entries.map((e) => `  <url><loc>${BASE_URL}${e.path}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
