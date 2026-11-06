# Tabs, spaces, tabs

A browser game: a code file grows one line at a time, and each new line must be indented with the opposite of the line above (tab, space, tab, space). The visible whitespace shows it: a pink arrow is a tab, a cyan dot is a space. As the file grows the camera tilts back until the file is a striped road thousands of lines long. Two of the same in a row and a giant cartoon hand, the linter, slaps the file. Wait too long and the editor auto-indents for you by copying the line above, which also counts.

Reference: [@nishiibe's peanut and pistachio game](https://x.com/nishiibe/status/2117940574112436323). Our own subject and look, no code or art from it. The linter is made up.

Open: `python3 -m http.server` in this folder, then `/`. Left half or Tab for a tab, right half or Space for a space (arrow keys work too, M mutes). Canvas 2D, no libraries, sound made with Web Audio.

- `?play` runs the self-playing demo: fast alternating input to 3,534 lines, one miss, the slap and the last line (about 21 s, loops).
- `?t=<seconds>` freezes that moment of the `?play` timeline. `?clean` hides the controls and hints.

Re-record: `node ../../../x-trend-ideas/_tools/record.mjs "http://127.0.0.1:<port>/<path>/?clean&play" video/tabs-spaces-tabs.mp4 --seconds 21 --fps 30 --w 1080 --h 1350`

Check input: `node check.mjs http://127.0.0.1:<port>/<path>/` tests Tab and Space keys (focus stays put), mouse and touch halves, a miss, the auto-indent timeout and restart.
