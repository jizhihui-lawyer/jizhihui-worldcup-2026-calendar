import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildCalendar,
  buildPlaceholderCalendar,
  escapeIcsText,
  foldIcsLine,
  getTournamentDateKeys,
  normalizeEvents,
  summaryZh
} from "../src/calendar.js";

test("date keys cover the full tournament window", () => {
  const keys = getTournamentDateKeys();

  assert.equal(keys[0], "20260611");
  assert.equal(keys.at(-1), "20260720");
  assert.equal(keys.length, 40);
});

test("pre-match events use Chinese fixture titles", () => {
  const [match] = normalizeEvents([sampleEvent()]);

  assert.equal(match.summary, "墨西哥 - 南非");
  assert.equal(match.location, "Estadio Banorte，Mexico City，Mexico");
  assert.deepEqual(match.venueGeo, {
    title: "Estadio Banorte",
    latitude: 19.302837,
    longitude: -99.150803
  });
  assert.match(match.description, /赛事：小组赛/);
  assert.match(match.description, /状态：未开赛/);
});

test("live or final matches include score in the summary", () => {
  const [match] = normalizeEvents([
    sampleEvent({
      statusType: { state: "post", completed: true, description: "Final" },
      homeScore: "2",
      awayScore: "1"
    })
  ]);

  assert.equal(summaryZh(match), "墨西哥 2 - 1 南非 · 完场");
});

test("knockout placeholder names are localized", () => {
  const [match] = normalizeEvents([
    sampleEvent({
      homeName: "Group A Winner",
      awayName: "Third Place Group A/B/C/D/F"
    })
  ]);

  assert.equal(match.summary, "A组第一 - A/B/C/D/F组第三名候选");
});

test("calendar output is a valid folded ICS feed", () => {
  const [match] = normalizeEvents([sampleEvent()]);
  const ics = buildCalendar([match], {
    generatedAt: new Date("2026-06-01T00:00:00Z"),
    reminderMinutes: 30
  });
  const unfolded = ics.replace(/\r\n /g, "");

  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /X-WR-CALNAME:jizhihui 2026/);
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /UID:world-cup-2026-760415@jizhihui\.github\.io/);
  assert.match(ics, /DTSTART:20260611T190000Z/);
  assert.match(ics, /SUMMARY:/);
  assert.match(unfolded, /GEO:19\.302837;-99\.150803/);
  assert.match(
    unfolded,
    /X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-APPLE-RADIUS=250;X-ADDRESS=/
  );
  assert.match(unfolded, /X-TITLE=Estadio Banorte:geo:19\.302837,-99\.150803/);
  assert.match(ics, /BEGIN:VALARM/);
  assert.match(ics, /\r\nEND:VCALENDAR\r\n$/);
});

test("placeholder calendar keeps the subscription URL alive before first action run", () => {
  const ics = buildPlaceholderCalendar({
    generatedAt: new Date("2026-06-01T00:00:00Z")
  });

  assert.match(ics, /jizhihui 2026 世界杯赛程正在更新/);
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
});

test("ICS escaping and folding handle calendar special characters", () => {
  assert.equal(escapeIcsText("A, B; C\\D\nE"), "A\\, B\\; C\\\\D\\nE");

  const folded = foldIcsLine(`DESCRIPTION:${"世界".repeat(40)}`);
  assert.ok(folded.includes("\r\n "));
});

function sampleEvent(overrides = {}) {
  const statusType = overrides.statusType ?? {
    state: "pre",
    completed: false,
    description: "Scheduled"
  };

  return {
    id: "760415",
    uid: "s:600~l:606~e:760415",
    date: "2026-06-11T19:00Z",
    season: { slug: "group-stage" },
    links: [
      {
        rel: ["summary", "desktop", "event"],
        href: "https://www.espn.com/soccer/match/_/gameId/760415/south-africa-mexico"
      }
    ],
    competitions: [
      {
        venue: {
          fullName: "Estadio Banorte",
          address: { city: "Mexico City", country: "Mexico" }
        },
        broadcasts: [{ names: ["FOX", "Tele", "Peacock"] }],
        status: {
          displayClock: overrides.displayClock ?? "0'",
          type: statusType
        },
        competitors: [
          {
            homeAway: "home",
            score: overrides.homeScore ?? "0",
            team: {
              displayName: overrides.homeName ?? "Mexico",
              abbreviation: "MEX"
            }
          },
          {
            homeAway: "away",
            score: overrides.awayScore ?? "0",
            team: {
              displayName: overrides.awayName ?? "South Africa",
              abbreviation: "RSA"
            }
          }
        ]
      }
    ]
  };
}
