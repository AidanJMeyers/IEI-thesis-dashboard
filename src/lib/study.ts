/**
 * BREATHE-CC study architecture.
 *
 * Verified against the production REDCap export of 2026-08-25 (REDCap v16.1.4):
 * `Data Dictionary 8-25.csv` (289 fields across 11 instruments) and
 * `Events 8-25.csv` (19 events, one arm). Field counts here are counted from
 * those files, not estimated — if the export is refreshed, recount rather than
 * editing these numbers by hand.
 */

export const REDCAP_EXPORT_DATE = '2026-08-25';
export const REDCAP_VERSION = 'v16.1.4';

export interface Instrument {
  name: string;
  label: string;
  fields: number;
  identifiers: number;
  ieiRole: string;
  /** Which IEI input this instrument feeds, if any. */
  feeds: 'outdoor' | 'indoor' | 'outcome' | 'covariate' | 'admin';
}

export const INSTRUMENTS: Instrument[] = [
  {
    name: 'identification_contact_information',
    label: 'Identification & Contact',
    fields: 23,
    identifiers: 7,
    ieiRole: 'Primary residential address — the anchor point for ambient exposure extraction.',
    feeds: 'outdoor',
  },
  {
    name: 'demographics_intake',
    label: 'Demographics / Intake',
    fields: 37,
    identifiers: 0,
    ieiRole:
      'Household income, parental education, insurance, housing tenure, food insecurity — the adjustment set for every outcome model.',
    feeds: 'covariate',
  },
  {
    name: 'primary_household_details',
    label: 'Primary Household Details',
    fields: 31,
    identifiers: 0,
    ieiRole: 'Home characteristics feeding the indoor source term.',
    feeds: 'indoor',
  },
  {
    name: 'primary_household_safety_perceptions',
    label: 'Primary Household Safety',
    fields: 10,
    identifiers: 0,
    ieiRole: 'Indoor environmental safety items at the primary residence.',
    feeds: 'indoor',
  },
  {
    name: 'secondary_household_details',
    label: 'Secondary Household Details',
    fields: 35,
    identifiers: 4,
    ieiRole: 'Multi-household children — the second home the IEI must weight separately.',
    feeds: 'indoor',
  },
  {
    name: 'secondary_household_safety_perceptions',
    label: 'Secondary Household Safety',
    fields: 11,
    identifiers: 0,
    ieiRole: 'Indoor environmental safety at the second home.',
    feeds: 'indoor',
  },
  {
    name: 'monthly_followup',
    label: 'Monthly Follow-up',
    fields: 47,
    identifiers: 0,
    ieiRole:
      'The outcome engine: exacerbation counts, C-ACT scores, medication use, healthcare utilisation, repeated across 18 monthly events.',
    feeds: 'outcome',
  },
  {
    name: 'prenatal_infant_history',
    label: 'Prenatal / Infant History',
    fields: 34,
    identifiers: 0,
    ieiRole: 'Early-life exposures used as covariates and in phenotype interpretation.',
    feeds: 'covariate',
  },
  {
    name: 'geocode_derived_variables',
    label: 'Geocode Derived Variables',
    fields: 19,
    identifiers: 0,
    ieiRole:
      'Already-derived geospatial variables — the hand-off point between REDCap and the kriging pipeline.',
    feeds: 'outdoor',
  },
  {
    name: 'change_of_address',
    label: 'Change of Address',
    fields: 38,
    identifiers: 4,
    ieiRole:
      'Residential mobility. A move mid-study means the ambient exposure surface must be re-extracted for the new location.',
    feeds: 'outdoor',
  },
  {
    name: 'change_of_contact',
    label: 'Change of Contact',
    fields: 4,
    identifiers: 2,
    ieiRole: 'Retention tracking only.',
    feeds: 'admin',
  },
];

export const TOTAL_FIELDS = INSTRUMENTS.reduce((n, i) => n + i.fields, 0);
export const TOTAL_IDENTIFIERS = INSTRUMENTS.reduce((n, i) => n + i.identifiers, 0);
export const FIELDS_WITH_BRANCHING = 142;

export const EVENT_STRUCTURE = {
  arms: 1,
  events: 19,
  baseline: 'Baseline (day 0, window 0 to +30)',
  followups: 'Month 1 through Month 18, at 30-day offsets with a −2/+28 day window',
  note:
    'Eighteen monthly follow-ups per participant is what makes trajectory modelling possible — and what makes the exposure side need a time dimension to match.',
};

/** The instrument drafted on Aug 31, 2026 and not yet submitted to IRB. */
export const TIME_ACTIVITY_SUPPLEMENT = {
  formName: 'time_activity_supplement',
  prefix: 'ta_',
  fields: 75,
  calculated: 8,
  descriptive: 6,
  identifiers: 7,
  identifierFields: [
    'ta_sec_address',
    'ta_sec_city',
    'ta_sec_zip',
    'ta_school_name',
    'ta_school_address',
    'ta_school_city',
    'ta_school_zip',
  ],
  sections: [
    'Where Your Child Spends Time',
    'Homes and Locations',
    'School or Childcare',
    'A Typical Weekday',
    'A Typical Weekend Day',
    'Outdoor Activity',
    'Getting Around',
    'Your Home Environment',
    'The Other Home',
    'Air Quality Awareness',
    'Derived Values',
  ],
  derivedFields: [
    'ta_wd_total',
    'ta_we_total',
    'ta_frac_outdoor',
    'ta_frac_home_indoor',
    'ta_frac_school_indoor',
    'ta_frac_other_indoor',
    'ta_frac_transit',
    'ta_budget_flag',
  ],
  status: 'Drafted 2026-08-31. Superseded by the reconciled 10-item set on 2026-09-09.',
  participantFacing: 61,
};

/* -------------------------------------------------------------------------- */
/*  Reconciliation — Sep 9, 2026                                               */
/* -------------------------------------------------------------------------- */

/**
 * Every participant-facing item in the Aug 31 draft, checked against the
 * production dictionary and against public records. The four verdicts account
 * for all 61. Numbers here are counted from the source files, not estimated.
 */
export type Verdict = 'duplicate' | 'external' | 'dropped' | 'retained';

export interface ReconciliationRow {
  drafted: string;
  n: number;
  verdict: Verdict;
  replacement: string;
}

export const RECONCILIATION: ReconciliationRow[] = [
  { drafted: 'ta_sec_address, ta_sec_city, ta_sec_zip', n: 3, verdict: 'duplicate', replacement: 'sec_street_address, sec_city, sec_zip_code — live, and already flagged Identifier = Y' },
  { drafted: 'ta_school_address, ta_school_city, ta_school_zip', n: 3, verdict: 'duplicate', replacement: 'school_address + school_lat / school_lon, populated via API import from school_name' },
  { drafted: 'ta_school_name', n: 1, verdict: 'duplicate', replacement: 'school_name and daycare_current_name' },
  { drafted: 'ta_school_attend', n: 1, verdict: 'duplicate', replacement: 'school_attendance and daycare_attend' },
  { drafted: 'ta_multi_residence', n: 1, verdict: 'duplicate', replacement: 'multi_household_custody' },
  { drafted: 'ta_nights_primary, ta_nights_secondary', n: 2, verdict: 'duplicate', replacement: 'primary_home_pct and secondary_home_pct_calc' },
  { drafted: 'ta_ac_type', n: 1, verdict: 'duplicate', replacement: 'ac_type' },
  { drafted: 'ta_stove_fuel', n: 1, verdict: 'duplicate', replacement: 'cook_fuel' },
  { drafted: 'ta_hood', n: 1, verdict: 'duplicate', replacement: 'exhaust_fan_use' },
  { drafted: 'ta_smoke_indoor', n: 1, verdict: 'duplicate', replacement: 'smoking_in_home, with intensity in cigarettes_per_day_home' },
  { drafted: 'ta_smoke_vehicle', n: 1, verdict: 'duplicate', replacement: 'smoking_in_car' },
  { drafted: 'ta_damp', n: 1, verdict: 'duplicate', replacement: 'visible_mold_baseline, damp_spots_baseline, water_leaks_year_baseline + monthly repeats' },
  { drafted: 'ta_sec_ac, ta_sec_stove, ta_sec_smoke', n: 3, verdict: 'duplicate', replacement: 'sec_ac_type, sec_cook_fuel, sec_smoking_in_home' },
  { drafted: 'ta_school_mode', n: 1, verdict: 'duplicate', replacement: 'transportation_means' },
  { drafted: 'ta_school_changed', n: 1, verdict: 'duplicate', replacement: 'change_of_address instrument' },

  { drafted: 'ta_school_start, ta_school_end, ta_school_days', n: 3, verdict: 'external', replacement: 'District bell schedules and TEA instructional calendars' },
  { drafted: 'ta_home_type, ta_home_age', n: 2, verdict: 'external', replacement: 'County appraisal district records — which also give living area, i.e. building volume' },
  { drafted: 'ta_road', n: 1, verdict: 'external', replacement: 'TxDOT roadway inventory and AADT counts' },
  { drafted: 'ta_industry', n: 1, verdict: 'external', replacement: 'EPA FRS / TRI and TCEQ Central Registry' },
  { drafted: 'ta_period, ta_period_start', n: 2, verdict: 'external', replacement: 'REDCap survey timestamp against the district academic calendar' },

  { drafted: 'ta_aqi_check, ta_aqi_action', n: 2, verdict: 'dropped', replacement: 'Avoidance behaviour is a mediator, not an input to exposure' },
  { drafted: 'ta_sports, ta_sports_hrs, ta_sports_time', n: 3, verdict: 'dropped', replacement: 'Absorbed into a single outdoor-timing item' },
  { drafted: 'ta_hvac_filter', n: 1, verdict: 'dropped', replacement: 'Weak predictor of F_inf next to windows and AC use' },
  { drafted: 'ta_candles', n: 1, verdict: 'dropped', replacement: 'Minor source with no validated weighting' },
  { drafted: 'ta_vape_indoor', n: 1, verdict: 'dropped', replacement: 'Captured by a two-word label amendment to smoking_in_home' },
  { drafted: 'ta_purifier_room', n: 1, verdict: 'dropped', replacement: 'Below the resolution of a single-zone mass-balance model' },
  { drafted: 'ta_vehicle_window', n: 1, verdict: 'dropped', replacement: 'Second-order within an already small transit term' },
  { drafted: 'ta_notes', n: 1, verdict: 'dropped', replacement: 'Free text with no analytic role' },
  { drafted: 'ta_survey_date', n: 1, verdict: 'dropped', replacement: 'REDCap records a survey timestamp automatically' },

  { drafted: 'ta_wd_* and ta_we_* hour grid', n: 12, verdict: 'retained', replacement: 'Compressed into 3 banded items plus a residual' },
  { drafted: 'ta_out_time', n: 1, verdict: 'retained', replacement: 'Becomes iei_out_when' },
  { drafted: 'ta_windows', n: 1, verdict: 'retained', replacement: 'Becomes iei_windows' },
  { drafted: 'ta_ac_use', n: 1, verdict: 'retained', replacement: 'Becomes iei_ac_use' },
  { drafted: 'ta_stove_freq', n: 1, verdict: 'retained', replacement: 'Becomes iei_stove_freq' },
  { drafted: 'ta_purifier', n: 1, verdict: 'retained', replacement: 'Becomes iei_purifier' },
  { drafted: 'ta_sec_windows', n: 1, verdict: 'retained', replacement: 'Becomes iei_sec_windows' },
];

export const VERDICT_TOTALS = RECONCILIATION.reduce(
  (acc, r) => ({ ...acc, [r.verdict]: (acc[r.verdict] ?? 0) + r.n }),
  {} as Record<Verdict, number>,
);

/* -------------------------------------------------------------------------- */
/*  The recommended minimal instrument                                         */
/* -------------------------------------------------------------------------- */

export interface MinimalItem {
  n: number;
  variable: string;
  type: 'radio' | 'checkbox' | 'yesno' | 'text' | 'calc';
  item: string;
  shownTo: string;
  term: string;
}

export const MINIMAL_SET = {
  formName: 'iei_supplement',
  prefix: 'iei_',
  participantFacing: 10,
  medianSeen: 7,
  staffCurated: 2,
  calculated: 5,
  descriptive: 2,
  totalRows: 19,
  newIdentifiers: 0,
  estimatedMinutes: 1.5,
  items: [
    { n: 1, variable: 'iei_out_wd', type: 'radio', item: 'Hours outdoors on a typical school day (5 bands)', shownTo: 'All', term: 'f — outdoor' },
    { n: 2, variable: 'iei_out_we', type: 'radio', item: 'Hours outdoors on a typical weekend day (5 bands)', shownTo: 'All', term: 'f — outdoor' },
    { n: 3, variable: 'iei_out_when', type: 'checkbox', item: 'Times of day usually outdoors (4 windows)', shownTo: 'Unless rarely outdoors', term: 'Diurnal O₃' },
    { n: 4, variable: 'iei_transit', type: 'radio', item: 'Time per day in a vehicle (5 bands)', shownTo: 'All', term: 'f — transit' },
    { n: 5, variable: 'iei_windows', type: 'radio', item: 'How often windows are open at home (4 levels)', shownTo: 'All', term: 'F_inf' },
    { n: 6, variable: 'iei_ac_use', type: 'radio', item: 'How hard cooling runs in warm months (4 levels)', shownTo: 'Unless ac_type = none', term: 'F_inf' },
    { n: 7, variable: 'iei_stove_freq', type: 'radio', item: 'How often the stove or oven is used (4 levels)', shownTo: 'Gas households only', term: 'C_source (NO₂)' },
    { n: 8, variable: 'iei_purifier', type: 'yesno', item: 'Air purifier or air cleaner in use', shownTo: 'All', term: 'C_source removal' },
    { n: 9, variable: 'iei_sec_windows', type: 'radio', item: 'Window opening at the second home', shownTo: 'Two-household families', term: 'F_inf (secondary)' },
    { n: 10, variable: 'iei_sec_ac_use', type: 'radio', item: 'Cooling use at the second home', shownTo: 'Two-household families', term: 'F_inf (secondary)' },
  ] as MinimalItem[],
};

/** Public records used in place of survey questions. */
export const EXTERNAL_SOURCES = [
  { source: 'District bell schedules + TEA instructional calendars', replaces: 'School start and end times, days per week', why: 'Exact to the minute, and catches early-release and holiday days no parent would report' },
  { source: 'NCES Common Core of Data; Private School Universe Survey', replaces: 'School address and coordinates', why: 'Already the basis of the existing API import' },
  { source: 'Texas HHS Child Care Regulation search', replaces: 'Childcare address and licensed hours', why: 'Licensed hours are on record; parents estimate' },
  { source: 'Nueces & San Patricio County Appraisal Districts', replaces: 'Home type and age', why: 'Also gives living area — building volume, which the mass-balance model needs and the draft never asked for' },
  { source: 'TxDOT Roadway Inventory + AADT counts', replaces: 'Distance to a major road', why: 'Continuous metres plus traffic volume, instead of a five-level guess' },
  { source: 'EPA FRS, TRI; TCEQ Central Registry', replaces: 'Distance to industrial facilities', why: 'Actual facility coordinates and reported releases' },
  { source: 'NOAA NCEI — KCRP daily climate', replaces: 'Seasonal AC assumptions', why: 'Required for infiltration modelling regardless' },
  { source: 'REDCap survey timestamp', replaces: 'Which schedule the parent is describing', why: 'Answered exactly, for every response, at zero burden' },
];

/** Companion Word documents, served from /public/deliverables. */
export const DELIVERABLE_DOCS = [
  {
    id: 'doc-field-inventory',
    title: 'IEI Field Inventory and Minimal Addition Set',
    file: 'IEI-Field-Inventory-and-Minimal-Additions.docx',
    pages: 12,
    bytes: 30173,
    summary:
      'Full inventory of production fields by IEI role, the item-by-item reconciliation of all 61 drafted items, the public-source substitutions, the 10-item recommendation, what the reduced scope costs, and the IRB analysis.',
  },
  {
    id: 'doc-sample-form',
    title: 'IEI Supplement — Sample Form and Item Justification',
    file: 'IEI-Supplement-Sample-Form-and-Justification.docx',
    pages: 10,
    bytes: 23745,
    summary:
      'The instrument rendered as a participant sees it, with variable names and REDCap field types marked, branching syntax, calculated-field expressions, staff-curated fields, and an item-by-item justification table.',
  },
];

/** What the IEI can and cannot be built from right now. */
export const IEI_INPUTS = [
  {
    id: 'ambient',
    label: 'Ambient pollutant surfaces',
    detail:
      'PM2.5, PM10, O₃, SO₂ from TCEQ/EPA stations, interpolated by ordinary kriging (LOOCV-validated) on a 5 km grid, UTM Zone 14N.',
    available: true,
    note: 'Builds on the existing South Texas AQ kriging framework.',
  },
  {
    id: 'primary_address',
    label: 'Primary residence location',
    detail: 'Already geocoded in production. Ambient concentrations extract directly.',
    available: true,
    note: null,
  },
  {
    id: 'indoor_partial',
    label: 'Indoor exposure items',
    detail:
      'Secondhand smoke and its intensity, cooking fuel, range-hood use, AC and heating type, mould, damp and water damage, pets — all live at baseline and mirrored for the secondary home and after a move.',
    available: true,
    note: 'Reconciled against the production dictionary on Sep 9, 2026. Confirmed present, not assumed.',
  },
  {
    id: 'school_address',
    label: 'School / childcare location',
    detail:
      'school_address, school_lat and school_lon are live in geocode_derived_variables, populated via API import from school_name. Daycare is handled identically.',
    available: true,
    note: 'Already collected under the approved protocol — this is not a new identifier.',
  },
  {
    id: 'secondary_address',
    label: 'Secondary residence location',
    detail:
      'sec_street_address through sec_zip_code are live in secondary_household_details and already flagged Identifier = Y, with jittered coordinates in geocode_derived_variables.',
    available: true,
    note: 'Already collected under the approved protocol — this is not a new identifier.',
  },
  {
    id: 'home_home_split',
    label: 'Home-versus-home time split',
    detail:
      'primary_home_pct gives the share of time at the primary residence; secondary_home_pct_calc derives the remainder. Reusable directly as a weight.',
    available: true,
    note: null,
  },
  {
    id: 'outcomes',
    label: 'Asthma outcomes',
    detail: 'Monthly exacerbation counts and C-ACT scores across up to 18 follow-up events.',
    available: true,
    note: null,
  },
  {
    id: 'time_budget',
    label: 'Within-day time budget',
    detail:
      'How the day splits between indoors at home, outdoors, school and transit. The home-versus-home split exists; this one does not, and it is the reason the index cannot yet be time-weighted from participant data.',
    available: false,
    note: 'Needs 3 banded items (iei_out_wd, iei_out_we, iei_transit). Pipeline falls back to literature defaults until then.',
  },
  {
    id: 'infiltration',
    label: 'Window and cooling behaviour',
    detail:
      'Drives F_inf in C_indoor = F_inf × C_ambient + C_source. Equipment type is captured; usage behaviour is not, so the indoor model currently collapses to an unvalidated constant.',
    available: false,
    note: 'Needs 2 items for the primary home (iei_windows, iei_ac_use), 2 more for the secondary.',
  },
  {
    id: 'transit',
    label: 'Time spent in vehicles',
    detail:
      'transportation_means records the mode but not the duration, and in-vehicle concentrations run well above both ambient and indoor levels.',
    available: false,
    note: 'Needs 1 banded item (iei_transit).',
  },
  {
    id: 'diurnal',
    label: 'Timing of outdoor activity',
    detail:
      'Ozone peaks mid-afternoon and is near zero at dawn. Two children with identical outdoor hours can differ threefold in ozone dose depending on when those hours fall.',
    available: false,
    note: 'Needs 1 checkbox item (iei_out_when).',
  },
];

export const TRANSLATION_STATUS = {
  headline: 'Spanish translation of the production instruments is current as of the Aug 25 export.',
  detail:
    'The Fields tab is finished and the Surveys tab needs two items re-translated: a new compensation sentence on the primary_household_details thank-you screen, and a piped participant identifier in the prenatal_infant_history instructions. The English moved in 284 places overall, but everything except those two was markup, so the approved Spanish still holds.',
  supplement:
    'The addition set has no Spanish version yet, and must be submitted to IRB alongside the English version rather than after it. At ten items that is roughly a day of translator time, against several days for the 61-item draft it replaces.',
};

/* -------------------------------------------------------------------------- */
/*  Publication                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The BREATHE-CC protocol paper. Note the journal: the thesis proposal and the
 * older context notes both say "submitted to BMJ Open 04/03/2026". It was in
 * fact published in BMC Public Health, and it is out — not under review. Cite
 * it from here rather than from those documents.
 */
export const PUBLICATION = {
  title:
    'Bridging Respiratory Exposures, Asthma, and Environmental Health in Corpus Christi (BREATHE-CC): a prospective cohort study protocol',
  journal: 'BMC Public Health',
  year: 2026,
  volume: '26',
  articleNumber: '2521',
  doi: '10.1186/s12889-026-28265-5',
  url: 'https://link.springer.com/article/10.1186/s12889-026-28265-5',
  doiUrl: 'https://doi.org/10.1186/s12889-026-28265-5',
  /** Served from public/papers — open access, so redistribution is permitted. */
  pdf: '/papers/BREATHE-CC-protocol-BMC-Public-Health-2026.pdf',
  pdfBytes: 1_447_548,
  license: 'CC BY-NC-ND 4.0',
  articleType: 'Study Protocol · Open Access',
  citation:
    'Warden, D. E., Meyers, A., Almekhlabi, H., Kuchavaram, M., Richmond, E., Allison-Hoien, M., Jin, L., Johnson, N., Roberts, J., & Melaram, R. (2026). BMC Public Health, 26, 2521.',
  authors: [
    'Donald E. Warden',
    'Aidan Meyers',
    'Hiea Almekhlabi',
    'Manasa Kuchavaram',
    'Erin Richmond',
    'Mari Allison-Hoien',
    'Lei Jin',
    'Natalie Johnson',
    'Jon Roberts',
    'Rajesh Melaram',
  ],
  /** Aidan is second author; Warden and Melaram contributed equally. */
  studentAuthorIndex: 1,
  correspondingAuthor: 'Rajesh Melaram',
};

/**
 * The cohort in the protocol's own terms. Useful when a committee member asks
 * "what is BREATHE-CC?" and deserves an answer that is not a paraphrase.
 */
export const COHORT_DESIGN = {
  rationale:
    'Childhood asthma disproportionately affects Hispanic children in the United States, yet few longitudinal cohorts exist in Gulf Coast communities where environmental exposures may compound sociodemographic vulnerabilities. Corpus Christi, a majority-Hispanic city with high levels of petrochemical industrial operations, reports higher asthma prevalence than state and national averages.',
  design: [
    {
      label: 'Population',
      value: 'Approximately 200 children under 10 years of age with asthma',
      detail: 'Enrolled from Driscoll Children’s Hospital.',
    },
    {
      label: 'Follow-up',
      value: 'Monthly for up to 18 months',
      detail:
        'Parent-reported modified ISAAC questionnaire capturing household exposures, asthma exacerbations, and wheezing episodes.',
    },
    {
      label: 'Validation',
      value: 'Electronic health record review',
      detail: 'Questionnaire responses are validated and supplemented against the EHR.',
    },
    {
      label: 'Exposure linkage',
      value: 'Daily PM2.5, PM10, O₃, SO₂',
      detail:
        'TCEQ and EPA monitoring station concentrations linked to participants’ geocoded addresses.',
    },
    {
      label: 'Analysis',
      value: 'GAMs, Poisson regression, GBTM',
      detail:
        'Associations between pollutant exposure, household risk factors, exacerbations, and wheezing phenotypes, adjusted for age, sex, BMI, and sociodemographic indicators. GBTM identifies latent wheezing phenotypes.',
    },
  ],
  positioning:
    'A longitudinal cohort examining Hispanic children residing in the Gulf Coast petrochemical corridor, integrating granular geospatial environmental monitoring with daily air pollutant linkage.',
};
