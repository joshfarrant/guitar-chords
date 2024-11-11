# guitar-chords

A quick and dirty guitar chord finder, inspired by Jacob Collier's five-string guitar in the DAEAD tuning.

I wanted to try the tuning on my own guitar, however there weren't any resources available to help me find chords. So I made this to help me out.

At a high level, it takes a guitar tuning, as well as the intervals for different types of chords, then generates all possible chords for a given root note. It then filters out the chords that contain fingerings that have a gap of more than 3 frets between them.

It was mostly written with the help of Copilot, but it does the job!

I've included some hand-picked chords — which were output from this program — in [chords.md](./chords.md).

```bash
bun install
bun run src/index.ts
```
