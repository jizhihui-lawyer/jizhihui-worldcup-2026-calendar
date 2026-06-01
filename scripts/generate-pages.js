import fs from "node:fs/promises";
import path from "node:path";
import {
  buildCalendar,
  buildPlaceholderCalendar,
  fetchTournamentEvents
} from "../src/calendar.js";

const root = new URL("..", import.meta.url).pathname;
const docsDir = path.join(root, "docs");
const feedFileName = "jizhihui-world-cup-2026-calendar.zh.ics";
const feedPath = path.join(docsDir, feedFileName);
const offline = process.argv.includes("--offline");

await fs.mkdir(docsDir, { recursive: true });

let ics;
let matchCount = 0;

if (offline) {
  ics = buildPlaceholderCalendar();
} else {
  const matches = await fetchTournamentEvents(fetch, {
    baseUrl: process.env.ESPN_SCOREBOARD_URL
  });
  matchCount = matches.length;
  ics = buildCalendar(matches);
}

await fs.writeFile(feedPath, ics, "utf8");
await fs.writeFile(path.join(docsDir, "index.html"), indexHtml(feedFileName), "utf8");
await fs.writeFile(path.join(docsDir, ".nojekyll"), "", "utf8");

console.log(
  offline
    ? `Wrote placeholder feed to docs/${feedFileName}`
    : `Wrote ${matchCount} matches to docs/${feedFileName}`
);

function indexHtml(feedFileName) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>jizhihui 2026 世界杯赛程日历</title>
  <style>
    :root {
      color-scheme: light dark;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #f7f7f4;
      color: #181a1b;
    }
    main {
      width: min(720px, calc(100vw - 40px));
    }
    h1 {
      font-size: clamp(2rem, 7vw, 4rem);
      line-height: 1;
      margin: 0 0 18px;
      letter-spacing: 0;
    }
    p {
      font-size: 1rem;
      margin: 0 0 22px;
      color: #4b5560;
    }
    a.button {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      padding: 0 16px;
      border-radius: 8px;
      background: #1266d6;
      color: white;
      text-decoration: none;
      font-weight: 650;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    code {
      display: block;
      max-width: 100%;
      overflow-wrap: anywhere;
      padding: 12px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.07);
      color: inherit;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background: #111315;
        color: #f4f7fb;
      }
      p {
        color: #c6cbd1;
      }
      code {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  </style>
</head>
<body>
  <main>
    <h1>jizhihui 2026 世界杯赛程日历</h1>
    <p>订阅后，日历 App 会显示全部比赛时间；赛中和赛后标题会自动带上比分。</p>
    <a class="button" href="./${feedFileName}">下载 ICS</a>
    <code id="feed-url">${feedFileName}</code>
    <script>
      const feed = new URL("./${feedFileName}", location.href).href;
      document.querySelector("a.button").href = feed;
      document.querySelector("#feed-url").textContent = feed;
    </script>
  </main>
</body>
</html>`;
}
