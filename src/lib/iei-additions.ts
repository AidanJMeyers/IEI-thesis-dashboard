/**
 * IEI Monthly Follow-up Additions — v4, September 28, 2026.
 *
 * The design as agreed in the Sep 28 meeting, and the one going to IRB.
 *
 * This is a different shape from the Sep 9 recommendation rather than a
 * revision of it. That recommendation was a standalone ten-item instrument.
 * v4 puts every addition inside the existing monthly follow-up and adds a
 * hidden carry-forward instrument, so the field count rises sharply while the
 * monthly burden falls: a family with nothing to change taps through summaries
 * instead of re-answering.
 *
 * Every number here is counted from the demo dictionary, not estimated.
 * Burden is reported in taps — one answer a parent gives — because that is
 * what Dr. Warden asked for and what a family actually experiences.
 */

export const MONTHLY_ADDITIONS = {
  version: 'v4',
  date: '2026-09-28',
  host: 'Existing monthly follow-up instrument',
  status:
    'Final as agreed in the Sep 28 meeting. Two decisions outstanding before IRB submission.',
  newFields: 238,
  modifiedFields: 10,
  /**
   * No existing question's wording, choices or saved data changes — the only
   * edit to live fields is a branching prefix on the medication items.
   */
  existingFieldChange:
    'The 10 modified fields are the existing medication items. Only their branching logic changes: "[fu_med_same]<>\'1\' and" is prepended to what is already there. Labels, choices, required settings and all saved data stay as they are, and months completed before the change still count.',
  newInstruments: [
    {
      name: 'iei_current_state',
      what: 'Hidden, on the baseline event, never seen by families. Calculated fields holding each family’s latest answers, read from Month 18 back to Month 1. Monthly surveys pipe their summaries from it, so a missed month loses nothing.',
    },
    {
      name: 'iei_staff_followup',
      what: 'Staff-only. Records text or phone follow-up and can correct a custody pattern when a family’s answers do not reconcile.',
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Burden                                                                     */
/* -------------------------------------------------------------------------- */

export interface BurdenRow {
  scenario: string;
  taps: number;
  questions: number;
  medsShown: number;
}

/** From running the dictionary's own branching logic on each scenario. */
export const BURDEN: {
  steadyState: BurdenRow[];
  goLive: BurdenRow[];
  annual: BurdenRow[];
  ceiling: BurdenRow[];
  comparison: string;
  netEffect: string;
} = {
  steadyState: [
    { scenario: 'One home', taps: 7, questions: 7, medsShown: 0 },
    { scenario: 'Two homes — same nights, or 1st/3rd/5th weekends', taps: 10, questions: 10, medsShown: 0 },
    { scenario: 'Two homes — alternating weeks, every other weekend, rotation', taps: 11, questions: 11, medsShown: 0 },
    { scenario: 'Two homes — something else', taps: 10, questions: 10, medsShown: 0 },
  ],
  goLive: [
    { scenario: 'One home', taps: 23, questions: 11, medsShown: 3 },
    { scenario: 'Two homes — same nights every week', taps: 37, questions: 19, medsShown: 3 },
    { scenario: 'Two homes — every other weekend', taps: 33, questions: 21, medsShown: 3 },
    { scenario: 'Two homes — two-week rotation', taps: 33, questions: 21, medsShown: 3 },
    { scenario: 'Two homes — something else', taps: 32, questions: 20, medsShown: 3 },
  ],
  annual: [
    { scenario: '12-month survey, nothing changed', taps: 8, questions: 8, medsShown: 0 },
    { scenario: '12-month survey, school changed', taps: 10, questions: 10, medsShown: 0 },
  ],
  ceiling: [
    { scenario: 'One home, on break, smoking and vaping yes', taps: 27, questions: 15, medsShown: 10 },
    { scenario: 'Two homes, plus a same-nights pattern and a break stay', taps: 48, questions: 30, medsShown: 10 },
  ],
  comparison:
    'For comparison, the current monthly form has 38 answerable fields, 19 of them always shown (23 with the four C-ACT child items). Existing medication questions: 3 always shown, up to 10 with follow-ups.',
  netEffect:
    'With the M2 medication review in place, the existing medication questions drop by 3 to 10 in a no-change month. For a one-home family the net monthly change therefore runs from +4 taps to −3.',
};

/* -------------------------------------------------------------------------- */
/*  The form                                                                   */
/* -------------------------------------------------------------------------- */

export interface AdditionSection {
  id: string;
  label: string;
  range: string;
  what: string;
  feeds: string;
}

export const ADDITION_SECTIONS: AdditionSection[] = [
  {
    id: 'sec0',
    label: '0 · This month',
    range: '0.2 – 0.3',
    what: 'Whether school is on its regular schedule, plus seasonal reminders in May–August and December–January when routines and custody time usually shift.',
    feeds: 'Says which routine applies this month, and re-opens Section A when the season flips.',
  },
  {
    id: 'secA',
    label: 'A · Daily routine',
    range: 'A1 – A6',
    what: 'The saved routine shown back for a one-tap check. If something changed, two seven-row matrices open pre-filled — weekday and weekend — with four columns: home inside, school or childcare inside, outside, part inside and part outside. Plus daily car time and a start date.',
    feeds: 'The time-activity weights. The core IEI input.',
  },
  {
    id: 'secB',
    label: 'B · Time between homes',
    range: 'B1 – B11',
    what: 'Two-home families only. Six custody patterns, each mapping to a projection rule, with an anchor night and a next-switch count so the child can be placed on any given date.',
    feeds: 'Which home the child is at on each night, weighting both homes’ indoor terms.',
  },
  {
    id: 'secC',
    label: 'C · Home habits',
    range: 'C1 – C21',
    what: 'Cooking frequency at each home, then smoking and vaping: indoor smoking, cigarettes per day, smoking in the car, vaping days per week and number of users — mirrored for the other home.',
    feeds: 'The indoor source term, on the same scales as the baseline items and the vaping dose literature.',
  },
  {
    id: 'secD',
    label: 'D · This past month',
    range: 'D1 – D12',
    what: 'Window opening at each home, where the child sleeps tonight, time at the other home, break stays of a week or longer, and whether storms or outages displaced the family.',
    feeds: 'Infiltration, plus short-term displacement the standing routine would otherwise miss.',
  },
  {
    id: 'secM',
    label: 'M · Medication review',
    range: 'M1 – M2',
    what: 'Shows the medication list reported last time and asks whether it still holds. Yes skips the existing medication questions for the month; No shows them exactly as they are today.',
    feeds: 'Nothing in the IEI. This is the burden offset that pays for the additions — and the clearest sell for Driscoll.',
  },
  {
    id: 'secP',
    label: 'P · Safety perception forms',
    range: 'P1 – P7',
    what: 'On the existing 3-month forms, not the monthly survey. Mitigation measures actually used, keeping the child inside on bad-air days, where families hear about air quality, and what would help.',
    feeds: 'Mitigation and avoidance behaviour. Read P1 and P6 as an access marker as well as a behaviour — covers and purifiers cost money — and adjust for SES.',
  },
];

/* -------------------------------------------------------------------------- */
/*  What the Sep 28 meeting changed                                            */
/* -------------------------------------------------------------------------- */

export const SEPT28_REMOVALS = [
  {
    id: 'C3 / C7',
    item: 'Air purifier',
    raisedBy: 'Dr. Warden',
    why: 'Cut from the monthly form. Purifier use is asked instead on the 3-month safety perception form (P1), alongside the other mitigation measures.',
  },
  {
    id: 'C4 / C8',
    item: 'Candles and incense',
    raisedBy: 'Dr. Warden, Dr. Melaram',
    why: 'Candle exposure cannot be quantified the way the incense literature does, and incense use here is seasonal at best.',
  },
  {
    id: 'C5',
    item: 'Car windows',
    raisedBy: 'Dr. Melaram, Dr. Warden',
    why: 'Little coverage expected in South Texas, and not enough to model against the burden it costs.',
  },
  {
    id: 'D2 / D4',
    item: 'Air conditioning use',
    raisedBy: 'Dr. Warden',
    why: 'HVAC type is already on file at baseline and predicts use, and parents with smart thermostats cannot answer how often it runs. Windows open (D1, D3) stays.',
  },
  {
    id: 'A3 / A4',
    item: 'Organized-sports column',
    raisedBy: 'Sep 21 and Sep 28',
    why: 'Organized sports counts as Outside. "Camp" was also dropped from the school column label.',
  },
  {
    id: 'D11 / D12',
    item: 'School change',
    raisedBy: 'Dr. Warden',
    why: 'Moved off the monthly form to the 12-month survey only, with the school on file piped in. Published school calendars fill in the rest.',
  },
];

export const SEPT28_KEPT = [
  {
    item: 'D10 storms and outages',
    raisedBy: 'Dr. Melaram',
    why: 'Outages are common here, and a generator or a stay somewhere else is a real short-term exposure. Pulling outage data by address is not workable — the Texas grid has many retail providers.',
  },
  {
    item: 'Monthly smoking review',
    raisedBy: 'Dr. Warden',
    why: 'Kept and repeated monthly for the same reason vaping is. The baseline answer is piped in and the family confirms or updates it.',
  },
];

/* -------------------------------------------------------------------------- */
/*  Open decisions (Section 10 of the v4 document)                             */
/* -------------------------------------------------------------------------- */

export interface OpenDecision {
  n: number;
  blocking: boolean;
  question: string;
  who: string;
  detail: string;
}

export const OPEN_DECISIONS: OpenDecision[] = [
  {
    n: 1,
    blocking: true,
    question: 'M1 / M2 medication review — keep it or cut it?',
    who: 'Mari',
    detail:
      'Dr. Warden flagged that it changes how an existing section is presented mid-study, and that medication reporting may look more complete after the switch than before. Deleting two fields and restoring the old branching removes it.',
  },
  {
    n: 2,
    blocking: true,
    question: 'Smoking recall against a baseline up to six months old',
    who: 'Driscoll',
    detail:
      'Is a single "is this still true?" against the baseline answer acceptable, or should smoking start fresh from the first monthly survey?',
  },
  {
    n: 3,
    blocking: false,
    question: 'A5 car time — keep the bands, or hours and minutes as a ratio of the day?',
    who: 'Team',
    detail: 'Flagged DISCUSS on the form itself.',
  },
  {
    n: 4,
    blocking: false,
    question: 'Safety perception items duplicate the monthly indoor-air questions',
    who: 'Team',
    detail:
      '@HIDDEN on the three primary and three secondary mold, damp and water-damage items would hide them without deleting data. Deleting the fields would delete their data.',
  },
  {
    n: 5,
    blocking: false,
    question: 'Back-dating cutoff for reported start dates',
    who: 'Team',
    detail: 'How far before the first IEI survey a start date may be applied. The thesis itself uses nothing before the first IEI survey.',
  },
  {
    n: 6,
    blocking: false,
    question: 'Matrix format — radio or checkbox?',
    who: 'Team',
    detail: 'Radio means one place per block, which is current. Checkbox means all that apply, split evenly.',
  },
  {
    n: 7,
    blocking: false,
    question: 'Dust mites — is the P1 covers option enough?',
    who: 'Dr. Melaram',
    detail: 'Or should the 3-month form also ask about carpet and bedding directly?',
  },
  {
    n: 8,
    blocking: false,
    question: 'Traffic near the home',
    who: 'Dr. Warden',
    detail:
      'Road class and traffic counts can be derived from TxDOT AADT data at the geocoded addresses instead of asking families. Confirm that is the preferred route.',
  },
];

export const BLOCKING_DECISIONS = OPEN_DECISIONS.filter((d) => d.blocking).length;

/**
 * Dr. Jin raised that new survey items add missing values and that a long
 * variable list strains any model using them all. The answer is not a shorter
 * list — it is that nothing is analysed one variable at a time.
 */
export const MISSINGNESS_ANSWER = [
  'Nothing is analysed one variable at a time. The routine grid, the schedule between homes and the home-habit items are inputs to two sub-indices, which combine into one exposure value per child per hour. The model sees the index, not the fields.',
  'Missingness is structural, not random. Most blanks come from branching — a one-home family never sees Section B. Those are questions that do not apply, handled as a separate category rather than imputed.',
  'Carry-forward reduces gaps rather than creating them. A missed month keeps the last saved routine, so a skipped survey does not leave a hole in the exposure series. It lowers confidence for that month, which is recorded.',
  'Where the count is still too high, items are collapsed into constructs before modelling — one indoor-source term from cooking frequency, smoking and vaping.',
  'Validation is limited by sample size, and the write-up says so. The thesis reports the index against the nearest-monitor approach on the cohort we have; fuller validation belongs to the methods paper.',
];
