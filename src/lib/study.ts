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
  status: 'Drafted 2026-08-31. Not submitted to IRB.',
};

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
      'Secondhand smoke, gas cooking, mould/dampness likely already exist at baseline across the household instruments.',
    available: true,
    note: 'Must be reconciled against the data dictionary before the supplement is submitted — duplicates have to come out of the import file.',
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
    label: 'Time-activity budget',
    detail:
      'Hours per day in each microenvironment. Without it the composite cannot be time-weighted from participant data.',
    available: false,
    note: 'Blocked on IRB. Pipeline falls back to literature-based defaults.',
  },
  {
    id: 'school_address',
    label: 'School / childcare address',
    detail:
      'Roughly 30–35 hours a week are assigned to the wrong location without it.',
    available: false,
    note: 'HIPAA identifier — this is what may force a consent addendum.',
  },
  {
    id: 'infiltration',
    label: 'AC type and window behaviour',
    detail:
      'Drives the infiltration factor in C_indoor = F_inf × C_ambient + C_source. Without it the indoor model collapses to an unvalidated constant.',
    available: false,
    note: 'Blocked on IRB.',
  },
  {
    id: 'transit',
    label: 'Transit mode and duration',
    detail: 'In-vehicle concentrations differ materially from ambient.',
    available: false,
    note: 'Blocked on IRB.',
  },
];

export const TRANSLATION_STATUS = {
  headline: 'Spanish translation of the production instruments is current as of the Aug 25 export.',
  detail:
    'The Fields tab is finished and the Surveys tab needs two items re-translated: a new compensation sentence on the primary_household_details thank-you screen, and a piped participant identifier in the prenatal_infant_history instructions. The English moved in 284 places overall, but everything except those two was markup, so the approved Spanish still holds.',
  supplement:
    'The Time-Activity Supplement has no Spanish version yet. It must be submitted to IRB alongside the English instrument, not after it.',
};
