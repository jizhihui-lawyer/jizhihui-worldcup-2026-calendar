const ESPN_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

const DEFAULT_START_DATE = "2026-06-11";
const DEFAULT_END_DATE = "2026-07-20";
const DEFAULT_CONCURRENCY = 6;
const DEFAULT_FETCH_TIMEOUT_MS = 12000;

const TEAM_NAMES_ZH = new Map(
  Object.entries({
    Algeria: "阿尔及利亚",
    Argentina: "阿根廷",
    Australia: "澳大利亚",
    Austria: "奥地利",
    Belgium: "比利时",
    "Bosnia-Herzegovina": "波黑",
    "Bosnia and Herzegovina": "波黑",
    Brazil: "巴西",
    Canada: "加拿大",
    "Cabo Verde": "佛得角",
    "Cape Verde": "佛得角",
    Colombia: "哥伦比亚",
    "Congo DR": "刚果（金）",
    Croatia: "克罗地亚",
    Curaçao: "库拉索",
    Curacao: "库拉索",
    Czechia: "捷克",
    "Czech Republic": "捷克",
    "DR Congo": "刚果（金）",
    Ecuador: "厄瓜多尔",
    Egypt: "埃及",
    England: "英格兰",
    France: "法国",
    Germany: "德国",
    Ghana: "加纳",
    Haiti: "海地",
    Iran: "伊朗",
    Iraq: "伊拉克",
    "Ivory Coast": "科特迪瓦",
    "Côte d'Ivoire": "科特迪瓦",
    Japan: "日本",
    Jordan: "约旦",
    Mexico: "墨西哥",
    Morocco: "摩洛哥",
    Netherlands: "荷兰",
    "New Zealand": "新西兰",
    Norway: "挪威",
    Panama: "巴拿马",
    Paraguay: "巴拉圭",
    Portugal: "葡萄牙",
    Qatar: "卡塔尔",
    "Saudi Arabia": "沙特阿拉伯",
    Scotland: "苏格兰",
    Senegal: "塞内加尔",
    "South Africa": "南非",
    "South Korea": "韩国",
    "Korea Republic": "韩国",
    Spain: "西班牙",
    Sweden: "瑞典",
    Switzerland: "瑞士",
    Tunisia: "突尼斯",
    Turkey: "土耳其",
    Türkiye: "土耳其",
    Turkiye: "土耳其",
    "United States": "美国",
    USA: "美国",
    Uruguay: "乌拉圭",
    Uzbekistan: "乌兹别克斯坦"
  })
);

const STAGES_ZH = new Map(
  Object.entries({
    "group-stage": "小组赛",
    group: "小组赛",
    "round-of-32": "32强赛",
    "round-of-16": "16强赛",
    "rd-of-16": "16强赛",
    quarterfinals: "四分之一决赛",
    semifinals: "半决赛",
    "third-place": "季军赛",
    "third-place-match": "季军赛",
    "3rd-place-match": "季军赛",
    final: "决赛"
  })
);

const VENUE_GEO = new Map(
  Object.entries({
    "AT&T Stadium": {
      title: "AT&T Stadium",
      latitude: 32.748138,
      longitude: -97.093231
    },
    "BC Place": {
      title: "BC Place",
      latitude: 49.276646,
      longitude: -123.112564
    },
    "BMO Field": {
      title: "BMO Field",
      latitude: 43.633087,
      longitude: -79.418961
    },
    "Estadio Akron": {
      title: "Estadio Akron",
      latitude: 20.681721,
      longitude: -103.463135
    },
    "Estadio Banorte": {
      title: "Estadio Banorte",
      latitude: 19.302837,
      longitude: -99.150803
    },
    "Estadio BBVA": {
      title: "Estadio BBVA",
      latitude: 25.669132,
      longitude: -100.244621
    },
    "GEHA Field at Arrowhead Stadium": {
      title: "GEHA Field at Arrowhead Stadium",
      latitude: 39.048855,
      longitude: -94.484474
    },
    "Gillette Stadium": {
      title: "Gillette Stadium",
      latitude: 42.09079,
      longitude: -71.264404
    },
    "Hard Rock Stadium": {
      title: "Hard Rock Stadium",
      latitude: 25.95783,
      longitude: -80.239326
    },
    "Levi's Stadium": {
      title: "Levi's Stadium",
      latitude: 37.403297,
      longitude: -121.969765
    },
    "Lincoln Financial Field": {
      title: "Lincoln Financial Field",
      latitude: 39.901325,
      longitude: -75.167862
    },
    "Lumen Field": {
      title: "Lumen Field",
      latitude: 47.595135,
      longitude: -122.331917
    },
    "Mercedes-Benz Stadium": {
      title: "Mercedes-Benz Stadium",
      latitude: 33.755371,
      longitude: -84.401436
    },
    "MetLife Stadium": {
      title: "MetLife Stadium",
      latitude: 40.813477,
      longitude: -74.074951
    },
    "NRG Stadium": {
      title: "NRG Stadium",
      latitude: 29.684702,
      longitude: -95.410965
    },
    "SoFi Stadium": {
      title: "SoFi Stadium",
      latitude: 33.953438,
      longitude: -118.339447
    }
  })
);

export function getTournamentDateKeys(
  startDate = DEFAULT_START_DATE,
  endDate = DEFAULT_END_DATE
) {
  const result = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  while (cursor <= end) {
    result.push(
      `${cursor.getUTCFullYear()}${pad2(cursor.getUTCMonth() + 1)}${pad2(
        cursor.getUTCDate()
      )}`
    );
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
}

export async function fetchTournamentEvents(fetchImpl = fetch, options = {}) {
  const dateKeys = options.dateKeys ?? getTournamentDateKeys();
  const baseUrl = options.baseUrl ?? ESPN_SCOREBOARD_URL;
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  const timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;

  const scoreboards = await mapLimit(dateKeys, concurrency, async (dateKey) => {
    const url = new URL(baseUrl);
    url.searchParams.set("dates", dateKey);
    url.searchParams.set("limit", "200");
    url.searchParams.set("region", "us");
    url.searchParams.set("lang", "en");
    return fetchJson(fetchImpl, url, timeoutMs);
  });

  return normalizeEvents(scoreboards.flatMap((board) => board.events ?? []));
}

export function normalizeEvents(events) {
  const byId = new Map();

  for (const event of events) {
    const id = String(event?.id ?? event?.uid ?? "");
    if (!id || !event?.date) continue;
    byId.set(id, event);
  }

  return [...byId.values()]
    .map(toMatch)
    .filter(Boolean)
    .sort((a, b) => {
      const byStart = a.start.getTime() - b.start.getTime();
      return byStart || a.id.localeCompare(b.id);
    });
}

export function buildCalendar(matches, options = {}) {
  const generatedAt = options.generatedAt ?? new Date();
  const reminderMinutes = options.reminderMinutes ?? 30;
  const calendarName = options.calendarName ?? "jizhihui 2026 世界杯赛程与比分";
  const calendarDescription =
    options.calendarDescription ??
    "jizhihui 制作的 2026 FIFA 世界杯赛程订阅；比赛进行中和赛后会显示比分。数据来源 ESPN。";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//jizhihui//World Cup 2026 Calendar//ZH",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `NAME:${escapeIcsText(calendarName)}`,
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    `X-WR-CALDESC:${escapeIcsText(calendarDescription)}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT30M",
    "X-PUBLISHED-TTL:PT30M"
  ];

  for (const match of matches) {
    lines.push(...buildEventLines(match, generatedAt, reminderMinutes));
  }

  lines.push("END:VCALENDAR");
  return `${lines.map((line) => foldIcsLine(line)).join("\r\n")}\r\n`;
}

export function buildPlaceholderCalendar(options = {}) {
  const generatedAt = options.generatedAt ?? new Date();
  const calendarName = "jizhihui 2026 世界杯赛程与比分";
  const start = new Date("2026-06-11T00:00:00Z");
  const end = new Date("2026-06-12T00:00:00Z");
  const event = {
    id: "jizhihui-updating",
    start,
    end,
    summary: "jizhihui 2026 世界杯赛程正在更新",
    description:
      "GitHub Actions 会自动拉取 ESPN 赛程并更新这个订阅日历。部署完成后，请在 Actions 页面手动运行一次 Update calendar feed，或等待定时任务自动运行。",
    location: "",
    sourceUrl: "https://www.espn.com/soccer/scoreboard?league=fifa.world",
    sequenceSeed: 0
  };
  return buildCalendar([event], {
    generatedAt,
    reminderMinutes: 0,
    calendarName,
    calendarDescription: "jizhihui 制作的 2026 世界杯赛程订阅。"
  });
}

export function toMatch(event) {
  const competition = event.competitions?.[0] ?? {};
  const competitors = competition.competitors ?? [];
  if (competitors.length < 2) return null;

  const home = findCompetitor(competitors, "home") ?? competitors[0];
  const away = findCompetitor(competitors, "away") ?? competitors[1];
  const start = new Date(event.date);
  if (Number.isNaN(start.getTime())) return null;

  const status = competition.status ?? event.status ?? {};
  const statusType = status.type ?? {};
  const stageSlug = event.season?.slug ?? "";
  const durationMinutes = stageSlug === "group-stage" ? 120 : 150;
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const venue = formatVenue(competition.venue);
  const venueGeo = venueGeoFor(competition.venue);
  const broadcasts = formatBroadcasts(competition.broadcasts);
  const sourceUrl = firstSummaryLink(event) ?? defaultEspnMatchUrl(event.id);

  const match = {
    id: String(event.id ?? event.uid),
    uid: String(event.uid ?? event.id),
    start,
    end,
    home: toTeam(home),
    away: toTeam(away),
    venue,
    venueGeo,
    broadcasts,
    sourceUrl,
    statusState: statusType.state ?? "",
    statusCompleted: Boolean(statusType.completed),
    statusText: statusTextZh(status),
    stage: stageTextZh(stageSlug),
    rawStatus: statusType.description ?? statusType.name ?? "",
    sequenceSeed: sequenceSeed(home, away, statusType),
    summary: ""
  };

  match.summary = summaryZh(match);
  match.description = descriptionZh(match);
  match.location = venue;
  return match;
}

export function summaryZh(match) {
  const home = match.home.zh;
  const away = match.away.zh;

  if (match.statusState === "pre" || !hasUsableScores(match)) {
    return `${home} - ${away}`;
  }

  const score = `${home} ${match.home.score} - ${match.away.score} ${away}`;
  if (match.statusCompleted) return `${score} · 完场`;
  return `${score} · ${match.statusText || "进行中"}`;
}

export function escapeIcsText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function foldIcsLine(line, limit = 75) {
  let output = "";
  let chunk = "";

  for (const char of line) {
    if (byteLength(chunk + char) > limit) {
      output += `${chunk}\r\n `;
      chunk = char;
    } else {
      chunk += char;
    }
  }

  return output + chunk;
}

function buildEventLines(match, generatedAt, reminderMinutes) {
  const lines = [
    "BEGIN:VEVENT",
    `UID:world-cup-2026-${safeUid(match.id)}@jizhihui.github.io`,
    `DTSTAMP:${formatUtcDateTime(generatedAt)}`,
    `DTSTART:${formatUtcDateTime(match.start)}`,
    `DTEND:${formatUtcDateTime(match.end)}`,
    `SUMMARY:${escapeIcsText(match.summary)}`,
    `DESCRIPTION:${escapeIcsText(match.description)}`,
    `LOCATION:${escapeIcsText(match.location)}`,
    ...structuredLocationLines(match),
    `URL:${escapeIcsText(match.sourceUrl)}`,
    `SEQUENCE:${match.sequenceSeed}`,
    `LAST-MODIFIED:${formatUtcDateTime(generatedAt)}`,
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT"
  ];

  if (Number.isInteger(reminderMinutes) && reminderMinutes > 0) {
    lines.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(match.summary)}`,
      `TRIGGER:-PT${reminderMinutes}M`,
      "END:VALARM"
    );
  }

  lines.push("END:VEVENT");
  return lines;
}

function structuredLocationLines(match) {
  if (!match.venueGeo) return [];

  const { latitude, longitude, title } = match.venueGeo;
  return [
    `GEO:${latitude};${longitude}`,
    [
      "X-APPLE-STRUCTURED-LOCATION",
      "VALUE=URI",
      "X-APPLE-RADIUS=250",
      `X-ADDRESS=${escapeIcsParam(match.location)}`,
      `X-TITLE=${escapeIcsParam(title)}`
    ].join(";") + `:geo:${latitude},${longitude}`
  ];
}

function descriptionZh(match) {
  const lines = [
    `赛事：${match.stage}`,
    `对阵：${match.home.zh} - ${match.away.zh}`,
    `状态：${match.statusText}`
  ];

  if (hasUsableScores(match) && match.statusState !== "pre") {
    lines.push(`比分：${match.home.score} - ${match.away.score}`);
  }

  if (match.venue) lines.push(`场地：${match.venue}`);
  if (match.broadcasts) lines.push(`转播：${match.broadcasts}`);
  lines.push(`来源：${match.sourceUrl}`);
  return lines.join("\n");
}

function toTeam(competitor) {
  const team = competitor.team ?? {};
  const displayName =
    team.displayName ??
    team.shortDisplayName ??
    team.name ??
    competitor.displayName ??
    competitor.name ??
    "TBD";

  return {
    id: String(team.id ?? competitor.id ?? ""),
    abbreviation: team.abbreviation ?? "",
    name: displayName,
    zh: teamNameZh(displayName),
    score: normalizeScore(competitor.score),
    winner: Boolean(competitor.winner)
  };
}

function teamNameZh(name) {
  const clean = String(name ?? "TBD").replace(/\s+/g, " ").trim();
  if (!clean || clean === "TBD") return "待定";
  if (TEAM_NAMES_ZH.has(clean)) return TEAM_NAMES_ZH.get(clean);

  const winnerPlayoff = clean.match(/^Winner Playoff Path ([A-Z])$/i);
  if (winnerPlayoff) return `附加赛${winnerPlayoff[1].toUpperCase()}胜者`;

  const winnerMatch = clean.match(/^Winner Match (\d+)$/i);
  if (winnerMatch) return `第${winnerMatch[1]}场胜者`;

  const loserMatch = clean.match(/^Loser Match (\d+)$/i);
  if (loserMatch) return `第${loserMatch[1]}场负者`;

  const groupWinner = clean.match(
    /^(?:(?:1st|First|Winner|Group winner)(?: Place)?(?: of)? Group ([A-L])|Group ([A-L]) Winner)$/i
  );
  if (groupWinner) return `${(groupWinner[1] ?? groupWinner[2]).toUpperCase()}组第一`;

  const groupRunnerUp = clean.match(
    /^(?:(?:2nd|Second|Runner-up|Group runner-up)(?: Place)?(?: of)? Group ([A-L])|Group ([A-L]) 2nd Place)$/i
  );
  if (groupRunnerUp) {
    return `${(groupRunnerUp[1] ?? groupRunnerUp[2]).toUpperCase()}组第二`;
  }

  const groupThird = clean.match(
    /^(?:(?:3rd|Third)(?: Place)?(?: of)? Group ([A-L])|Group ([A-L]) 3rd Place)$/i
  );
  if (groupThird) return `${(groupThird[1] ?? groupThird[2]).toUpperCase()}组第三`;

  const multiGroupThird = clean.match(/^Third Place Group ([A-L/]+)$/i);
  if (multiGroupThird) return `${multiGroupThird[1].toUpperCase()}组第三名候选`;

  const roundWinner = clean.match(/^Round of (32|16) (\d+) Winner$/i);
  if (roundWinner) return `${roundWinner[1]}强第${roundWinner[2]}场胜者`;

  const quarterWinner = clean.match(/^Quarterfinal (\d+) Winner$/i);
  if (quarterWinner) return `四分之一决赛第${quarterWinner[1]}场胜者`;

  const semifinalWinner = clean.match(/^Semifinal (\d+) Winner$/i);
  if (semifinalWinner) return `半决赛第${semifinalWinner[1]}场胜者`;

  const semifinalLoser = clean.match(/^Semifinal (\d+) Loser$/i);
  if (semifinalLoser) return `半决赛第${semifinalLoser[1]}场负者`;

  return clean;
}

function statusTextZh(status) {
  const type = status.type ?? {};
  if (type.completed) return "完场";
  if (type.state === "in") {
    return status.displayClock || type.shortDetail || type.description || "进行中";
  }
  if (type.state === "pre") return "未开赛";
  return type.shortDetail || type.description || "状态待定";
}

function stageTextZh(slug) {
  return STAGES_ZH.get(slug) ?? slug ?? "世界杯";
}

function findCompetitor(competitors, homeAway) {
  return competitors.find((competitor) => competitor.homeAway === homeAway);
}

function formatVenue(venue) {
  if (!venue) return "";
  const parts = [venue.fullName, venue.address?.city, venue.address?.country]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean);
  return parts.join("，");
}

function venueGeoFor(venue) {
  const fullName = String(venue?.fullName ?? "").trim();
  if (!fullName) return null;
  return VENUE_GEO.get(fullName) ?? null;
}

function formatBroadcasts(broadcasts = []) {
  const names = broadcasts.flatMap((broadcast) => broadcast.names ?? []);
  return [...new Set(names)].join("、");
}

function firstSummaryLink(event) {
  const links = [...(event.links ?? []), ...(event.competitions?.[0]?.links ?? [])];
  return links.find((link) => link.rel?.includes("summary"))?.href ?? null;
}

function defaultEspnMatchUrl(id) {
  return `https://www.espn.com/soccer/match/_/gameId/${id}`;
}

function normalizeScore(score) {
  if (score === undefined || score === null || score === "") return "";
  return String(score);
}

function escapeIcsParam(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/:/g, "\\:");
}

function hasUsableScores(match) {
  return match.home.score !== "" && match.away.score !== "";
}

function sequenceSeed(home, away, statusType) {
  const totalGoals = Number(home.score || 0) + Number(away.score || 0);
  if (statusType.completed) return 100 + totalGoals;
  if (statusType.state === "in") return 10 + totalGoals;
  return 0;
}

async function fetchJson(fetchImpl, url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url.toString(), {
      headers: { accept: "application/json" },
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`ESPN returned ${response.status} for ${url}`);
    }
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}

function formatUtcDateTime(date) {
  return `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(
    date.getUTCDate()
  )}T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(
    date.getUTCSeconds()
  )}Z`;
}

function safeUid(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, "-");
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function byteLength(value) {
  return new TextEncoder().encode(value).length;
}
