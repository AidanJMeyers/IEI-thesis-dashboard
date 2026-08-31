# Thesis Proposal Summary (v2.0)

**Title:** Environmental Exposure and Childhood Asthma Outcomes: Development and Validation of an Integrated Exposure Index Using the BREATHE-CC Cohort

**Student:** Aidan Meyers, Rollins College Honors Degree Program
**Thesis Sponsor:** Dr. Shan-Estelle Brown, Dept. of Anthropology, Rollins College
**Committee:** Dr. Raheleh Mohammadi (Public Health), Dr. JJ Jasser (Data Analytics)
**External Guidance:** Dr. Rajesh Melaram, PI of BREATHE-CC, TAMU-CC

## The Problem

Most environmental epidemiology studies assess outdoor and indoor exposures independently, failing to capture the total exposure burden experienced by a child across multiple microenvironments throughout the day. No prior work has operationalized a single, portable, time-weighted composite index that combines ambient pollutant surfaces with household-level indoor exposures for pediatric asthma research.

## Aim 1: Develop and Validate the IEI

Create a weighted composite exposure metric integrating:
- **Outdoor:** Ambient PM2.5, PM10, O3, SO2 from TCEQ/EPA stations via Inverse Distance Weighting; residential proximity to highways and industrial zones
- **Indoor:** Secondhand smoke, gas cooking, mold/dampness, ventilation quality, pet allergens from BREATHE-CC surveys
- **Time-weighting:** Using percentage-of-time variables across multiple residences and microenvironments

Validate through sensitivity analyses (varying weighting schemes, spatial interpolation methods) and comparison against single-pollutant models.

## Aim 2: Test IEI-Asthma Outcome Associations

Using available BREATHE-CC data, examine IEI associations with:
- (a) Monthly asthma exacerbation frequency — Poisson/negative binomial regression
- (b) Childhood Asthma Control Test (C-ACT) scores — linear mixed models
- (c) Wheezing phenotype trajectories — Group-Based Trajectory Modeling (GBTM)

All models adjust for sociodemographic covariates. Pipeline built as reproducible, documented codebase for rerunning on finalized cohort.

## Scope Note

An earlier proposal version included a Neighborhood Completeness Index (NCI) and NCI × IEI interaction analysis. Scope was refined to focus on the IEI in depth. The NCI remains viable future work post-thesis.

## Disciplinary Grounding

- **Environmental & Public Health Epidemiology:** Exposure assessment, outcome modeling
- **Medical Anthropology & Community Health:** Ecological and biocultural interpretive framework
- **Geospatial Science:** Geocoding, kriging, spatial interpolation
- **Data Science & Mathematics:** Composite indexing, pipeline automation, statistical programming
- **Biochemistry & Clinical Medicine:** Mechanistic understanding of pollutant-disease pathways

## Publication Plan

- **Manuscript 1** (Honors Thesis, Spring 2027): IEI methods paper
- **Manuscript 2** (Post-thesis, ~2028): Full integrated exposure-outcome analysis on complete BREATHE-CC cohort

## Key Dates

| Milestone | Date |
|-----------|------|
| Thesis work begins | Aug 31, 2026 |
| Annotated Bibliography due | Sep 15, 2026 |
| Literature Review due | Oct 18, 2026 |
| IEI Manuscript Draft due | Nov 8, 2026 |
| Fall Presentation | ~Nov 30, 2026 |
| Fall Finals | Dec 7-11, 2026 |
| Spring classes begin | Jan 13, 2027 |
| Health Outcome Pipeline Draft due | Mar 1, 2027 |
| IEI Manuscript Finalization due | Apr 1, 2027 |
| Final Pipeline due | Apr 15, 2027 |
| Research Poster (Honors Summit) | April 2027 |
| Thesis Defense | ~Apr 22-28, 2027 |
| Final Submission | May 1, 2027 |
