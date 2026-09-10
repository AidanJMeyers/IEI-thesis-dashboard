/**
 * The approved interdisciplinary honors thesis proposal, v2.0.
 *
 * Transcribed from `MeyersAidan Full_Interdisc_Proposal.pdf` (May 20, 2026) —
 * the most recent version in the thesis folder. Wording is the proposal's own;
 * nothing here is paraphrased, so the page can be read as the document of
 * record rather than a summary of it.
 *
 * Where the proposal has since been overtaken by events (the protocol is now
 * published rather than submitted; the supplement was reconciled on Sep 9), the
 * page marks it inline rather than silently editing the text.
 */

export const PROPOSAL_META = {
  version: 'v2.0',
  program: 'Rollins College Honors Degree Program',
  date: 'April 8, 2026 (Revised May 2026)',
  sourceFile: 'MeyersAidan Full_Interdisc_Proposal.pdf',
  title:
    'Environmental Exposure and Childhood Asthma Outcomes: Development and Validation of an Integrated Exposure Index Using the BREATHE-CC Cohort',
  student: 'Aidan Meyers',
  sponsor: 'Dr. Shan-Estelle Brown, Department of Anthropology, Rollins College of Liberal Arts',
  committee: [
    'Dr. Raheleh Mohammadi, Public Health Program, Rollins Hamilton Holt School',
    'Dr. JJ Jasser, Director of Data Analytics, Rollins College of Liberal Arts',
  ],
};

export interface ProposalSection {
  id: string;
  numeral: string;
  title: string;
}

/** Drives the sticky table of contents and the scroll-spy. */
export const PROPOSAL_SECTIONS: ProposalSection[] = [
  { id: 'background', numeral: 'I', title: 'Background and Context' },
  { id: 'description', numeral: 'II', title: 'Project Description and Objectives' },
  { id: 'grounding', numeral: 'III', title: 'Disciplinary Grounding' },
  { id: 'justification', numeral: 'IV', title: 'Interdisciplinary Justification' },
  { id: 'preparation', numeral: 'V', title: 'Academic Preparation and Experience' },
  { id: 'methods', numeral: 'VI', title: 'Methods' },
  { id: 'committee', numeral: 'VII', title: 'Thesis Sponsor and Committee' },
  { id: 'framework', numeral: 'VIII', title: 'Summary Framework' },
  { id: 'evaluation', numeral: 'IX', title: 'Thesis Evaluation Criteria' },
  { id: 'references', numeral: '', title: 'References' },
];

export const DISCIPLINES = [
  {
    name: 'Environmental and Public Health Epidemiology',
    short: 'Environmental Epidemiology',
    caption: 'exposure modeling',
    body: 'The study design, exposure assessment (Inverse Distance Weighting, time-weighted averages), and outcome modeling (Group Based Trajectory Modeling, Generalized Additive Models, Poisson regression) derive from environmental epidemiological methods (Guarnieri & Balmes, 2014).',
  },
  {
    name: 'Medical Anthropology and Community Health',
    short: 'Medical Anthropology',
    caption: 'built environment',
    body: "Medical anthropology provides the interpretive framework that makes environmental exposure biologically and socially meaningful: it grounds the IEI in an ecological and biocultural model of health, in which household conditions, neighborhood infrastructure, and everyday social context are understood as pathways through which place becomes embodied in a child's respiratory biology. Dr. Brown's expertise in community health and the social ecology of health disparities affecting racial and ethnic minority communities provides the theoretical foundation for interpreting how socioeconomic status, housing instability, multigenerational living, and food insecurity mediate environmental exposure and health.",
  },
  {
    name: 'Geospatial Science',
    short: 'Geospatial Science',
    caption: 'geocoding & mapping',
    body: 'Geocoding, proximity analysis, buffer calculations, and spatial interpolation of pollutant concentrations draw on geographic information science. The AI-powered workflow to compute NCI from coordinate inputs requires applied GIS methodology.',
  },
  {
    name: 'Data Science and Mathematics',
    short: 'Data Science & Mathematics',
    caption: 'pipelines & statistics',
    body: 'The automated pipeline for NCI computation, weighted composite indexing, and integration of heterogeneous data sources (surveys, air quality monitoring, geospatial databases, EHRs) require computational approaches including API integration, workflow automation, and statistical programming in SAS and R.',
  },
  {
    name: 'Biochemistry and Clinical Medicine',
    short: 'Biochemistry & Clinical Medicine',
    caption: 'mechanistic pathways',
    body: 'Mechanistic understanding of how environmental pollutants interact with biological systems — oxidative stress, signal transduction cascades, immune dysregulation — allows exposure–outcome associations to be interpreted within a biochemical framework rather than a purely statistical one.',
  },
];

export const PROPOSED_TIMELINE = [
  {
    phase: 'Summer 2026',
    course: 'HON 498',
    activities:
      'Independent IEI foundation: data inventory, methodology design, pipeline development, sensitivity analysis, validation, preliminary manuscript drafting.',
  },
  {
    phase: 'Fall 2026',
    course: 'HON 498/9',
    activities:
      'IEI method manuscript drafting; annotated bibliography; literature review; beginning IEI–outcome association analysis (bivariate and adjusted regression models on available data); fall progress presentation.',
  },
  {
    phase: 'Spring 2027',
    course: 'HON 499',
    activities:
      'Complete health outcome analysis pipeline (sensitivity checks, GBTM phenotyping); final manuscript writing and assembly; research poster; thesis defense (2–3 weeks before spring finals); final submission to Rollins Honors Program.',
  },
];

export const COMMITTEE_TABLE = [
  {
    role: 'Thesis Sponsor',
    name: 'Dr. Shan-Estelle Brown',
    detail:
      'Dept. of Anthropology, Rollins College; Director, Global Health Minor. Ph.D., University of Connecticut; Postdoctoral Research Associate, Yale School of Medicine. Expertise: medical anthropology, community health, neighborhood determinants, SES.',
  },
  {
    role: 'Committee Member',
    name: 'Dr. Raheleh Mohammadi',
    detail:
      'Dept. of Health Professions, Public Health Program, Rollins College. Ph.D., University of Nebraska Medical Center; M.P.H., Rollins. Expertise: public health, epidemiology, health disparities, environmental health.',
  },
  {
    role: 'Committee Member',
    name: 'Dr. JJ Jasser',
    detail:
      'Director of Data Analytics, Rollins College. Ph.D. in Computer Science. Expertise: data science, computational methods.',
  },
  {
    role: 'External Guidance',
    name: 'Dr. Rajesh Melaram',
    detail:
      'Principal Investigator, BREATHE-CC, Texas A&M University–Corpus Christi. Provides external guidance on epidemiological methodology, data access, and environmental exposure science. Not a committee member.',
  },
];

export interface Reference {
  authors: string;
  year: string;
  title: string;
  source: string;
  doi?: string;
}

/** The proposal's reference list, in its original order. */
export const REFERENCES: Reference[] = [
  {
    authors: 'Akinbami, L. J., Simon, A. E., & Rossen, L. M.',
    year: '2016',
    title: 'Changing trends in asthma prevalence among children',
    source: 'Pediatrics, 137(1)',
    doi: 'https://doi.org/10.1542/peds.2015-2354',
  },
  {
    authors: 'Alcala, C. S., Lamadrid-Figueroa, H., Tamayo-Ortiz, M., et al.',
    year: '2024',
    title: 'Prenatal exposure to phthalates and childhood wheeze and asthma in the PROGRESS cohort',
    source: 'Science of The Total Environment, 954, 176311',
    doi: 'https://doi.org/10.1016/j.scitotenv.2024.176311',
  },
  {
    authors: 'Brauer, M., Roth, G. A., Aravkin, A. Y., et al.',
    year: '2024',
    title:
      'Global burden and strength of evidence for 88 risk factors in 204 countries and 811 subnational locations, 1990–2021: a systematic analysis for the Global Burden of Disease Study 2021',
    source: 'The Lancet, 403(10440), 2162–2203',
    doi: 'https://doi.org/10.1016/S0140-6736(24)00933-4',
  },
  {
    authors: 'Gruenwald, T., Seals, B. A., Knibbs, L. D., & Hosgood, H. D.',
    year: '2023',
    title: 'Population attributable fraction of gas stoves and childhood asthma in the United States',
    source: 'International Journal of Environmental Research and Public Health, 20(1), 75',
    doi: 'https://www.mdpi.com/1660-4601/20/1/75',
  },
  {
    authors: 'Guarnieri, M., & Balmes, J. R.',
    year: '2014',
    title: 'Outdoor air pollution and asthma',
    source: 'The Lancet, 383(9928), 1581–1592',
    doi: 'https://doi.org/10.1016/S0140-6736(14)60617-6',
  },
  {
    authors: 'Henderson, J., Granell, R., Heron, J., et al.',
    year: '2008',
    title:
      'Associations of wheezing phenotypes in the first 6 years of life with atopy, lung function and airway responsiveness in mid-childhood',
    source: 'Thorax, 63(11), 974–980',
    doi: 'https://doi.org/10.1136/thx.2007.093187',
  },
  {
    authors: 'Hu, C.-Y., Gutierrez-Avila, I., He, M. Z., et al.',
    year: '2024',
    title:
      'Windows of susceptibility and joint effects of prenatal and postnatal ambient air pollution and temperature exposure on asthma and wheeze in Mexican children',
    source: 'Environment International, 193, 109122',
    doi: 'https://doi.org/10.1016/j.envint.2024.109122',
  },
  {
    authors: 'Huang, W., Schinasi, L. H., Kenyon, C. C., et al.',
    year: '2021',
    title:
      'Effects of ambient air pollution on childhood asthma exacerbation in the Philadelphia metropolitan Region, 2011–2014',
    source: 'Environmental Research, 197, 110955',
    doi: 'https://doi.org/10.1016/j.envres.2021.110955',
  },
  {
    authors: 'Jin, L., & Melaram, R.',
    year: '2025',
    title:
      'Investigating asthma disparities in Hispanic communities using machine learning algorithms on the All of Us Researcher Workbench',
    source: 'Healthcare (Basel), 13(23)',
    doi: 'https://doi.org/10.3390/healthcare13233178',
  },
  {
    authors: 'Keet, C. A., McCormack, M. C., Pollack, C. E., et al.',
    year: '2015',
    title:
      'Neighborhood poverty, urban residence, race/ethnicity, and asthma: Rethinking the inner-city asthma epidemic',
    source: 'Journal of Allergy and Clinical Immunology, 135(3), 655–662',
    doi: 'https://doi.org/10.1016/j.jaci.2014.11.022',
  },
  {
    authors: 'Khreis, H., Kelly, C., Tate, J., et al.',
    year: '2017',
    title:
      'Exposure to traffic-related air pollution and risk of development of childhood asthma: A systematic review and meta-analysis',
    source: 'Environment International, 100, 1–31',
    doi: 'https://doi.org/10.1016/j.envint.2016.11.012',
  },
  {
    authors: 'Lin, W., Brunekreef, B., & Gehring, U.',
    year: '2013',
    title:
      'Meta-analysis of the effects of indoor nitrogen dioxide and gas cooking on asthma and wheeze in children',
    source: 'International Journal of Epidemiology, 42(6), 1724–1737',
    doi: 'https://doi.org/10.1093/ije/dyt150',
  },
  {
    authors: 'Pajewska-Szmyt, M., Klupczyńska-Gabryszak, A., Matysiak, J., et al.',
    year: '2025',
    title: 'Association of childhood asthma with the concept of exposomics: A short review',
    source: 'Med Sci Monit, 31, e949589',
    doi: 'https://doi.org/10.12659/msm.949589',
  },
  {
    authors: 'Patti, M. A., Henderson, N. B., Phipatanakul, W., & Jackson-Browne, M.',
    year: '2024',
    title:
      'Recommendations for clinicians to combat environmental disparities in pediatric asthma: A review',
    source: 'CHEST, 166(6), 1309–1318',
    doi: 'https://doi.org/10.1016/j.chest.2024.07.143',
  },
  {
    authors: 'Sanchez-Warren, D., Meyers, A., Warden, D. E., Newton, A. R., Jin, L., & Melaram, R.',
    year: '2025',
    title:
      'Daily time series analysis of ambient ozone and fine particulate matter levels in Corpus Christi, Texas',
    source: 'Water, Air, & Soil Pollution, 237(4), 217',
    doi: 'https://doi.org/10.1007/s11270-025-08778-2',
  },
  {
    authors: 'Tischer, C. G., Hohmann, C., Thiering, E., et al.',
    year: '2011',
    title:
      'Meta-analysis of mould and dampness exposure on asthma and allergy in eight European birth cohorts: an ENRIECO initiative',
    source: 'Allergy, 66(12), 1570–1579',
    doi: 'https://doi.org/10.1111/j.1398-9995.2011.02712.x',
  },
  {
    authors: 'Warden, D. E., Zhang, H., Jiang, Y., Arshad, H. S., & Karmaus, W.',
    year: '2025',
    title: 'The role of wheezing subtypes in the development of early childhood asthma',
    source: 'Respiratory Research, 26(1), 79',
    doi: 'https://doi.org/10.1186/s12931-025-03153-5',
  },
  {
    authors: 'WHO',
    year: '2021',
    title:
      'WHO global air quality guidelines: Particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide',
    source: 'World Health Organization',
    doi: 'https://www.who.int/publications/i/item/9789240034228',
  },
  {
    authors: 'Zanobetti, A., Ryan, P. H., Coull, B. A., et al.',
    year: '2024',
    title:
      'Early-life exposure to air pollution and childhood asthma cumulative incidence in the ECHO CREW Consortium',
    source: 'JAMA Network Open, 7(2), e240535',
    doi: 'https://doi.org/10.1001/jamanetworkopen.2024.0535',
  },
];

/**
 * Places where the approved proposal has been overtaken by events. Shown inline
 * so the committee reads the document of record and the correction together,
 * rather than a quietly edited text that no longer matches their copy.
 */
export interface ProposalErratum {
  id: string;
  /** Short label for the summary list. */
  label: string;
  /** Section anchor the note appears beside. */
  section: string;
  text: string;
  /** Whether the approved document itself needs editing, or only the reader's context. */
  kind: 'document-error' | 'overtaken-by-events';
}

export const PROPOSAL_ERRATA: ProposalErratum[] = [
  {
    id: 'threefold',
    label: '“Threefold” significance lists two points',
    section: 'description',
    kind: 'document-error',
    text: 'The proposal announces the significance as "threefold" but enumerates only two points. Worth resolving before the committee reads it.',
  },
  {
    id: 'nci',
    label: 'Descoped NCI still referenced in Methods and Grounding',
    section: 'grounding',
    kind: 'document-error',
    text: 'Methods and Disciplinary Grounding still reference the Neighborhood Completeness Index and the NCI × IEI interaction, which the Note on Scope removes. Residual text from v1.',
  },
  {
    id: 'publication',
    label: 'Protocol is published, not submitted',
    section: 'description',
    kind: 'overtaken-by-events',
    text: 'The proposal states the protocol was "submitted to BMJ Open 04/03/2026". It was subsequently published in BMC Public Health (2026) 26:2521 — see the study context page.',
  },
  {
    id: 'supplement',
    label: 'Time-weighting variables partly absent',
    section: 'description',
    kind: 'overtaken-by-events',
    text: 'Time-weighting relies on "existing percentage-of-time variables collected in the cohort". The Sep 9 reconciliation found these are partly absent; a 10-item addition set covers the gap.',
  },
];

/** Lookup used by the inline notes, so the summary and the margin cannot drift. */
export function erratum(id: string): string {
  return PROPOSAL_ERRATA.find((e) => e.id === id)?.text ?? '';
}
