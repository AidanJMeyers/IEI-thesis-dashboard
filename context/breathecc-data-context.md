# BREATHE-CC Data Context for IEI Construction

## What BREATHE-CC Is

BREATHE-CC (Bridging Respiratory Exposures, Asthma, and Environmental Health — Corpus Christi) is a prospective pediatric respiratory health cohort study developed by the Melaram Lab at Texas A&M University–Corpus Christi and based at Driscoll Children's Hospital in Corpus Christi, Texas. It follows children with asthma through monthly surveys, electronic health record (EHR) abstraction, and geospatial environmental monitoring in a predominantly Hispanic coastal community. Target enrollment is approximately 200 children. Study protocol manuscript submitted to BMJ Open 04/03/2026.

## Current Data Infrastructure

### REDCap Survey Instruments (Already in Production)
1. **Identification & Contact** — demographics, contact info, primary address (geocoded)
2. **Demographics/Intake** — household composition, socioeconomic variables
3. **Primary Household Details** — home characteristics
4. **Primary Household Safety** — indoor environmental safety factors
5. **Secondary Household Details** — for multi-household children
6. **Secondary Household Safety** — indoor environmental safety at second home
7. **Prenatal/Infant History** — early life exposures
8. **Monthly Follow-up** — recurring survey: asthma symptoms, exacerbations, C-ACT scores, medication use, healthcare utilization
9. **Change of Address** — address update tracking
10. **Change of Contact** — contact info updates

### Available for IEI Construction (Without Supplement)
- **Primary residential address** — already geocoded, can be used for ambient pollutant surface extraction
- **Some indoor exposure questions** — secondhand smoke, gas cooking, mold/dampness likely exist at baseline (NEED TO RECONCILE against data dictionary)
- **Monthly C-ACT scores** — from follow-up surveys
- **Exacerbation counts** — from follow-up surveys
- **Sociodemographic covariates** — household income, parental education, insurance status, housing tenure, food insecurity

### NOT Available Without the Time-Activity Supplement
- **Time-activity budget** — how many hours per day in each microenvironment (critical for time-weighting)
- **School/childcare address** — needed for geocoding school-location ambient exposure (~30-35 hrs/week misassigned without this)
- **Secondary residence address** — for multi-household children
- **AC type and window behavior** — needed for infiltration factor modeling (without these, indoor concentration model collapses to an unvalidated constant)
- **Transit mode and duration** — in-vehicle exposure differs from ambient
- **Outdoor activity timing** — needed for diurnal ozone exposure adjustment

### The Critical Gap
Without time-activity data, the IEI cannot be properly time-weighted. A preliminary IEI can still be constructed using literature-based assumptions for time-activity patterns, but this is a known and significant limitation. The pipeline should be built to accept either source (literature defaults OR participant-reported data) and the manuscript should report both approaches if participant data becomes available.

## Time-Activity Supplement (Drafted Aug 31, 2026)

A 74-field REDCap instrument (`time_activity_supplement`, prefix `ta_`) has been drafted. It captures:
- Multi-residence status and secondary address
- School/childcare attendance and address
- Weekday and weekend time-activity budgets (hours in each microenvironment)
- Outdoor activity timing (relevant for diurnal ozone peaks)
- AC type, window behavior (infiltration factor drivers)
- Gas cooking frequency and range hood use
- Secondhand smoke and vaping exposure
- Air purifier use, HVAC filter maintenance
- Mold/dampness, proximity to roads and industry
- Air quality awareness and avoidance behavior

### IRB Status
**Not yet submitted.** Requires IRB modification approval before deployment. Key considerations:
1. Address collection (school, secondary residence) are HIPAA identifiers — may require consent addendum
2. Pattern-of-life data on minors — needs specific security framing
3. Spanish translation required for bilingual cohort
4. Estimated turnaround: 2-6 weeks from submission

### Reconciliation Needed
Several fields in the supplement may already exist at baseline (marked ⚠ in the design memo): gas cooking, secondhand smoke, mold/dampness. The BREATHE-CC data dictionary must be exported and reconciled before the supplement is submitted to IRB. Duplicates should be removed from the supplement import file.

## Ambient Air Quality Data

### Monitoring Network
TCEQ and EPA operate monitoring stations in the Corpus Christi / Coastal Bend region measuring:
- PM2.5 (fine particulate matter)
- PM10 (coarse particulate matter)
- O3 (ozone)
- SO2 (sulfur dioxide)
- NOx (nitrogen oxides)
- VOCs (volatile organic compounds)

### Existing Geospatial Work
Prior BREATHE-CC work (Sanchez-Warren et al., 2025) established:
- Time series analysis of ambient ozone and PM in Corpus Christi
- Geospatial exposure characterization framework
- Monitoring station coordinates and data access pipelines

### Spatial Interpolation Approach
The IEI pipeline will use ordinary kriging (with LOOCV for validation) to generate pollutant concentration surfaces from monitoring station data. This builds on the existing kriging framework from the South Texas AQ pipeline (5 km grid, UTM Zone 14N). Each participant's residential, school, and secondary addresses will be used to extract location-specific ambient concentrations from these surfaces.

## Statistical Analysis Plan

### IEI Construction (Aim 1)
1. Geocode all addresses (primary, school, secondary)
2. Extract ambient concentrations via kriging surfaces
3. Score indoor exposures from survey data
4. Model indoor concentrations: C_indoor = F_inf × C_ambient + C_source
5. Compute time-weighted composite: IEI_i = Σ_j (f_ij × C_ij)
6. Sensitivity analyses: weighting schemes, interpolation methods, single-pollutant comparisons

### Health Outcome Analysis (Aim 2)
1. **Exacerbation frequency** — Poisson or negative binomial regression (test for overdispersion)
2. **C-ACT scores** — Linear mixed models (random intercept for participant, IEI as fixed effect)
3. **Wheezing phenotypes** — Group-Based Trajectory Modeling (GBTM), then IEI as predictor of group membership via multinomial logistic regression
4. All models adjust for: household income, parental education, insurance status, housing tenure, food insecurity
5. Software: SAS 9.4 and R 4.3+

### Reproducibility
The entire pipeline will be version-controlled on GitHub with:
- Clear documentation and README
- Sample data for testing
- Automated scripts for each analysis step
- Session info and package versions recorded
