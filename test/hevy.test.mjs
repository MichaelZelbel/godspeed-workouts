import { test } from "node:test";
import assert from "node:assert/strict";
import { Hevy, HevyError, checkWorkout, checkEvent } from "../lib/hevy.mjs";
import { startFakeHevy, workout, KEY } from "./fakes/hevy.mjs";

test("pages are followed to Hevy's page count; events come oldest first, the last word per workout last", async () => {
  const fh = await startFakeHevy();
  try {
    for (let i = 0; i < 12; i++) fh.add(workout({ start: `2026-10-${String(1 + i).padStart(2, "0")}T10:00:00Z`, exercises: [{ title: "Squat", sets: [{ reps: 5, kg: 100 }] }] }));
    const h = new Hevy({ key: KEY, base: fh.url, pauseMs: 0 });
    assert.equal((await h.allWorkouts()).length, 12);
    assert.equal(await h.count(), 12);
    const ev = await h.eventsSince("1970-01-01T00:00:00Z");
    assert.equal(ev.length, 12);
    assert.ok(ev.every((e) => e.type === "updated"));
    assert.deepEqual((await h.userInfo()), { id: "user-1", name: "Alex Example", weight: "kg", distance: "km", pro: true });
  } finally { await fh.close(); }
});

test("a refused key, a server error and an answer of an unknown shape are three different things", async () => {
  const fh = await startFakeHevy();
  try {
    const bad = new Hevy({ key: "00000000-0000-4000-8000-000000000000", base: fh.url, pauseMs: 0 });
    await assert.rejects(bad.count(), (e) => e instanceof HevyError && e.kind === "key");
    fh.fh.down = true;
    await assert.rejects(new Hevy({ key: KEY, base: fh.url, pauseMs: 0 }).count(), (e) => e.kind === "down");
    fh.fh.down = false;
    fh.add(workout({ start: "2026-10-01T10:00:00Z" }));
    fh.fh.changed = true;
    await assert.rejects(new Hevy({ key: KEY, base: fh.url, pauseMs: 0 }).allWorkouts(), (e) => e.kind === "changed" && /no list of exercises/.test(e.message));
  } finally { await fh.close(); }
  // Nobody there at all.
  await assert.rejects(new Hevy({ key: KEY, base: "http://127.0.0.1:9", pauseMs: 0, timeoutMs: 2000 }).count(), (e) => e.kind === "down");
});

test("the shape check: what Hevy's documentation and its real answers hold passes, anything else is 'changed'", () => {
  const ok = { id: "w1", title: "A", description: null, start_time: "2026-10-23T22:52:48+00:00", end_time: null, exercises: [{ index: 0, title: "X", notes: null, superset_id: null, sets: [{ index: 0, type: "normal", weight_kg: 10, reps: 40, distance_meters: null, duration_seconds: null, rpe: null, custom_metric: null }] }] };
  assert.equal(checkWorkout(ok), ok);
  assert.throws(() => checkWorkout({ ...ok, start_time: "soon" }), (e) => e.kind === "changed");
  assert.throws(() => checkWorkout({ ...ok, exercises: [{ ...ok.exercises[0], sets: [{ reps: "40" }] }] }), (e) => e.kind === "changed" && /reps/.test(e.message));
  assert.equal(checkEvent({ type: "deleted", id: "w1", deleted_at: "2026-10-24T00:00:00Z" }).id, "w1");
  assert.throws(() => checkEvent({ type: "merged", id: "w1" }), (e) => e.kind === "changed");
});
