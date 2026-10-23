// Reads the real Hevy account behind HEVY_API_KEY, read only, and prints each workout as the row it
// becomes. Nothing is written anywhere and the key is never printed.
//
//   HEVY_API_KEY=... node test/live/hevy-read.mjs [--tz Europe/Berlin] [--expect-neck]
//
// --expect-neck checks the first workout logged on 24 October 2026 (Berlin): "Neck workout",
// Cervical extension 40 x 10 kg and Neck flexion 10 x 10 kg, and exits 1 when it is not so.
import { Hevy } from "../../lib/hevy.mjs";
import { rowData } from "../../lib/rows.mjs";

const args = process.argv.slice(2);
const tz = args.includes("--tz") ? args[args.indexOf("--tz") + 1] : "Europe/Berlin";
if (!process.env.HEVY_API_KEY) { console.error("Set HEVY_API_KEY."); process.exit(2); }
const hevy = new Hevy({ key: process.env.HEVY_API_KEY.trim() });
const user = await hevy.userInfo();
const all = await hevy.allWorkouts();
const count = await hevy.count();
const since = await hevy.eventsSince("2026-10-01T00:00:00Z");
// The answer an hourly run gets most often: nothing since the last run.
const none = await hevy.eventsSince(new Date().toISOString());
if (none.length) { console.log("FAIL events since now are not empty"); process.exit(1); }
console.log(`account units ${user.weight}/${user.distance}, Hevy Pro ${user.pro}; ${all.length} workout(s) listed, count says ${count}; ${since.length} event(s) since 1 October`);
for (const w of all) console.log(JSON.stringify({ id: w.id, ...rowData(w, { tz, units: user }) }, null, 1));
if (args.includes("--expect-neck")) {
  const neck = all.map((w) => ({ w, r: rowData(w, { tz, units: user }) })).find(({ r }) => r.workout === "Neck workout" && r.when.startsWith("2026-10-24"));
  const ok = neck && neck.r.exercises === "Cervical extension: 40 x 10 kg\nNeck flexion: 10 x 10 kg" && neck.r.sets === 2;
  console.log(ok ? `PASS the neck workout reads as expected (${neck.w.id})` : "FAIL the neck workout is not there as expected");
  process.exit(ok ? 0 : 1);
}
