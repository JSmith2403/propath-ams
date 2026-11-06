# Archive

Components that are switched off but kept on purpose, so they can be brought back.

| File | What it was | Why it's here | To restore |
|---|---|---|---|
| `MobilityTab.jsx` | The athlete profile's Mobility tab (joint range-of-motion entries and chart). | Removed from the profile 2026-11-06: nice, but no home for it yet. The data is untouched (`phase2.mobility`, and the Data Entry mobility sheet still writes to it). | Move back to `src/components/tabs/`, fix the import paths, add it to `TABS` in `AthleteProfile.jsx`. |
| `ReportTab.jsx` | The old in-app report builder (progress report with testing, goals and maturation sections). | Replaced by the Reports log (a list of files per athlete). It will be rebuilt as a report generation tab. | As above. |

Nothing here is imported by the app, so it isn't part of the build.
