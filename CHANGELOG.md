# Changes

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
