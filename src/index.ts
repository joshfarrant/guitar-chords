type Note = string;

type StringTuning = {
  note: Note;
  octave: number;
};

type GuitarTuning = {
  name: string;
  strings: StringTuning[];
};

type ChordType = {
  name: string;
  intervals: number[];
};

const tunings: GuitarTuning[] = [
  {
    name: 'Jacob Collier',
    strings: [
      { note: 'D', octave: 2 },
      { note: 'A', octave: 2 },
      { note: 'E', octave: 3 },
      { note: 'A', octave: 3 },
      { note: 'D', octave: 3 },
    ],
  },
];

const chordTypes: ChordType[] = [
  { name: 'maj', intervals: [0, 4, 7] },
  { name: 'min', intervals: [0, 3, 7] },
  { name: 'min7', intervals: [0, 3, 7, 10] },
  { name: '7', intervals: [0, 4, 7, 10] },
  { name: 'maj7', intervals: [0, 4, 7, 11] },
  { name: 'aug', intervals: [0, 4, 8] },
  { name: 'dim', intervals: [0, 3, 6] },
  { name: 'dim7', intervals: [0, 3, 6, 9] },
  { name: 'm7b5', intervals: [0, 3, 6, 10] },
  { name: 'sus2', intervals: [0, 2, 7] },
  { name: 'sus4', intervals: [0, 5, 7] },
  { name: '9', intervals: [0, 4, 7, 10, 14] },
];

const notes: Note[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

// Parse command line arguments
const args = process.argv.slice(2);

let rootNote = 'C';
let chordName = 'maj';
let minFret = 0;
let maxFret = 12;

// Extract positional arguments
if (args.length >= 2) {
  rootNote = args[0];
  chordName = args[1];
}

// Extract optional arguments
args.forEach((arg) => {
  if (arg.startsWith('--min=')) {
    minFret = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--max=')) {
    maxFret = parseInt(arg.split('=')[1], 10);
  }
});

const noteToMidi = (note: Note, octave: number): number => {
  return notes.indexOf(note) + 12 * (octave + 1);
};

const midiToNote = (midi: number): Note => {
  return notes[midi % 12];
};

const generateFingerings = (
  tuning: GuitarTuning,
  rootNote: Note,
  chordType: ChordType,
): number[][] => {
  const chordFingerings: number[][] = [];

  // Generate MIDI note number for root note
  const rootMidi = notes.indexOf(rootNote);

  // Generate chord notes in MIDI numbers
  const chordNotes = chordType.intervals.map(
    (interval) => (rootMidi + interval) % 12,
  );

  // Generate MIDI note numbers for each string
  const stringNotes = tuning.strings.map((s) => noteToMidi(s.note, s.octave));

  // Generate possible fingerings
  const backtrack = (currentFingering: number[], stringIndex: number) => {
    if (stringIndex === tuning.strings.length) {
      // Check if current fingering forms the chord
      const notesPlayed = currentFingering.map(
        (fret, idx) => (stringNotes[idx] + fret) % 12,
      );
      const isFullChord = chordNotes.every((note) =>
        notesPlayed.includes(note),
      );
      const isExactChord = notesPlayed.every((note) =>
        chordNotes.includes(note),
      );
      if (isFullChord && isExactChord) {
        // Check practical fingering (max fret span <= 3)
        const fretsUsed = currentFingering.filter((f) => f > 0);
        if (
          fretsUsed.length === 0 ||
          Math.max(...fretsUsed) - Math.min(...fretsUsed) <= 3
        ) {
          chordFingerings.push([...currentFingering]);
        }
      }
      return;
    }

    for (let fret = minFret; fret <= maxFret; fret++) {
      currentFingering.push(fret);
      backtrack(currentFingering, stringIndex + 1);
      currentFingering.pop();
    }
  };

  backtrack([], 0);
  return chordFingerings;
};

const tuning = tunings[0];
const chordType = chordTypes.find((c) => c.name === chordName);

if (chordType) {
  const fingerings = generateFingerings(tuning, rootNote, chordType);

  console.log(
    `${rootNote}${chordName} between frets ${minFret} and ${maxFret}`,
  );

  fingerings.forEach((fingering) => {
    // Compute the notes each string plays
    const notesPlayed = fingering.map((fret, idx) => {
      const stringMidi = noteToMidi(
        tuning.strings[idx].note,
        tuning.strings[idx].octave,
      );
      const midiNote = stringMidi + fret;
      return midiToNote(midiNote);
    });
    console.log(`${fingering} (${notesPlayed})`);
  });
} else {
  console.log('Chord type not found.');
}
