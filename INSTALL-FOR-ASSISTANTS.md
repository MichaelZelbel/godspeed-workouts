# Adding Workouts: steps for an AI assistant

Your person said something like "add the Hevy add-on", "bring my workouts into the notebook" or
"install godspeed-workouts". Do the technical part yourself; they only make the Hevy key.

## 1. Check that it fits

- Godspeed Mission Control is installed and its notebook runs on this machine (on a server: as
  root). `godspeed-workouts status` answers if the add-on is already there; installing again is the
  update.
- They need Hevy Pro. The key is made at https://hevy.com/settings?developer (Settings, Developer,
  in Hevy's web app). Ask them for it in one sentence with that link. Never ask for their Hevy
  password.

## 2. Install

On a Linux server, as root, with the key they gave you:

```bash
curl -fsSL https://raw.githubusercontent.com/MichaelZelbel/godspeed-workouts/main/install.sh | HEVY_API_KEY='<their key>' bash -s -- --godspeed <their mission control folder>
```

On Windows, in PowerShell:

```powershell
$env:HEVY_API_KEY = '<their key>'; irm https://raw.githubusercontent.com/MichaelZelbel/godspeed-workouts/main/install.ps1 | iex; Remove-Item Env:HEVY_API_KEY
```

The key goes in through the environment for that one command only. Never put it on a command line
as an argument, in a file of the mission control, or in a message.

Read what it prints. "Hevy refused that key" means the key is wrong or Hevy Pro is not active: say
so in one sentence. At the end it prints the tracker's link: give them that link and say that
every workout they log in Hevy arrives there within the hour.

## 3. Later

- **They send a new Hevy key** (the add-on told them the old one stopped working):
  `HEVY_API_KEY='<the key>' godspeed-workouts connect`. It checks the key, keeps it and brings the
  notebook level at once.
- **"The health talk may also look at my Workouts tracker"**: the notebook's own tracker-talk
  operation, as for any tracker. The add-on never changes which talks read it.
- **"How often did I train this month?"**: read the Workouts tracker's rows.
- **Something looks wrong**: `godspeed-workouts status`, then `godspeed-workouts run`.
