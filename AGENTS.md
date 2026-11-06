# Working in this repository

Workouts is an add-on for Godspeed Mission Control. It brings every workout a person logs in Hevy
into their Godspeed notebook: one row per workout in the notebook's "Workouts" tracker, with every
set. Hevy is the first source; the code keeps Hevy's part in `lib/hevy.mjs` so another app can be a
second source later.

- How it is built: `docs/architecture.md`. What it promises the person (the rule for their own
  edits, what a deletion does, when it sends a message): `README.md`. Keep both true.
- Tests: `node --test "test/*.test.mjs"` (fast, no network). `test/notebook.test.mjs` also runs
  against a real Godspeed notebook when `GODSPEED_NOTEBOOK_CHECKOUT` names a checkout of the product
  (MichaelZelbel/godspeed-mission-control); without it that part is skipped and says so.
  `node test/live/hevy-read.mjs` reads the person's real Hevy account (read only) with
  `HEVY_API_KEY` in the environment (`--expect "<workout title>"` also checks that a workout with
  that title is there).
- CI: this repository is public, so its minutes are free. Every push runs the fast tests and the
  real-notebook test on Linux; Windows and macOS run by hand (workflow_dispatch) and on version
  tags, and may be added to every push once they have been seen passing. A red run is a real
  failure: keep main green.

House rules:

- Node.js 22 or newer, Node's own modules only. No npm packages.
- The Hevy key is a setting in the private state folder (`hevy.json`, readable by its owner only),
  never in code, a log, a message, a command line or the notebook. Never print it.
- Made-up workouts only in tests, examples and docs, never a real person's.
- Hevy asks: polling hourly or daily, never at minute 0. The schedule picks a random minute.
- A message to the person only when they can act, at most one per problem. Everything else goes
  to the log and `godspeed-workouts status`.
- Every notebook write carries the version just read (`expected`), so a change the person saves in
  that moment is never written over.
- Plain everyday English in everything a person reads. No em dashes and no en dashes.
