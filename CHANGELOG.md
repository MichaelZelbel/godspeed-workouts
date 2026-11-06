# Changes

## 0.1.2 (6 November 2026)

- Ready to be public. No change to what the add-on does. Every workout in the README, the tests
  and the live check is made up, and the live check (`test/live/hevy-read.mjs`) takes the title of
  any workout to look for with `--expect "<title>"` instead of one fixed workout. No path of one
  person's computer is left: the installers look for Godspeed in its documented default folders
  (`~/godspeed-v2`, `~/godspeed`, or the folder named by `--godspeed`), and the tests use an
  example path. The README points to Godspeed's Settings as the way in. The full history was
  scanned for secrets (gitleaks 8.30.1, six commits, none found).

## 0.1.1 (24 October 2026)

- Hevy's real answers where they differ from its documentation: with no events since the last run
  it answers an empty "workouts" list instead of an empty "events" list, and a page past the last is
  404 "Page not found". Both are now read as "nothing"; any other unexpected answer is still a
  change that stops the run and, when it lasts, is said once. Found by the first hourly run on the
  server; the pretend Hevy in the tests now answers the same way.

## 0.1.0 (24 October 2026)

- Hevy as the first source: every workout becomes one row of the notebook's Workouts tracker, with
  every set (reps x weight, warm-ups, drop sets, failure, RPE, time, distance, supersets, notes).
- The backfill of every workout ever logged, then Hevy's events every hour at a random minute, and a
  daily count check that reads everything again when Hevy and the rows differ.
- A cell the person changes in the notebook stays theirs; "Your comment" and their own columns are
  never written; a row they delete is not made again; a workout deleted in Hevy keeps its row when
  the row holds something of theirs.
- One message per problem they can act on (the key refused, Hevy's answers changed, the notebook
  refused a row, the add-on failed), on the assistant's Telegram bot or as a desktop notification.
- The hourly run as a systemd timer (server and desktop), a LaunchAgent (macOS) or a scheduled task
  (Windows).
