# Time-Activity Supplement: Design Memo

**Integrated Exposure Index (Aim 2) — Interdisciplinary Honors Thesis, Aidan Meyers**
Instrument: `time_activity_supplement` · Prefix: `ta_` · 74 fields · ~6 min median completion

---

## 1. Status of the variable inventory

The BREATHE-CC data dictionary is not present in any loaded Skill. `breathe-cc-branding` covers visual identity and document standards; `honors-thesis` covers thesis framing, committee roles, and formatting; `ml-aq-analysis` covers the ambient monitoring side in full.

This memo therefore specifies **what the IEI requires**, not **what BREATHE-CC lacks**. Fields likely to already exist at baseline are marked ⚠ in §4 and should be deleted from the import file before submission if duplicated.

Fastest resolution: REDCap → Project Setup → Data Dictionary → Download, then reconcile.

---

## 2. What the IEI actually requires

The skill defines the IEI as a weighted composite integrating outdoor ambient pollutant exposures with indoor household exposures, time-weighted across multiple residences. Formally:

```
IEI_i = Σ_j ( f_ij × C_ij )        where  Σ_j f_ij = 1
```

- `i` = participant
- `j` = microenvironment
- `f_ij` = fraction of the week spent in microenvironment *j*
- `C_ij` = pollutant concentration in that microenvironment

### 2.1 Microenvironment categories

Seven mutually exclusive, collectively exhaustive buckets. Exhaustiveness matters — an incomplete budget silently reweights everything else.

| # | Microenvironment | Concentration source |
|---|---|---|
| 1 | Indoors, primary residence | Infiltration model on kriged ambient at home address + indoor sources |
| 2 | Outdoors, at/near primary residence | Kriged ambient at home address |
| 3 | Indoors, school/childcare | Infiltration model on kriged ambient at school address |
| 4 | Outdoors, school/childcare | Kriged ambient at school address |
| 5 | Indoors, elsewhere | Infiltration model on kriged ambient at home address (assumed proxy) |
| 6 | Outdoors, elsewhere | Kriged ambient at home address (assumed proxy) |
| 7 | In transit | Ambient × in-vehicle enrichment factor |

Multi-residence children split buckets 1–2 across two addresses by `ta_nights_secondary / 7`.

### 2.2 The indoor term

Indoor concentration is never measured, so it is modeled:

```
C_indoor = F_inf × C_ambient + C_source
```

`F_inf` (infiltration factor) is driven by AC type, AC use intensity, and window-opening behavior. In coastal South Texas this varies enormously — a household running central AC with sealed windows has `F_inf` around 0.3–0.5 for PM2.5, while an open-window household approaches 0.8–1.0. **Without window and AC variables, the indoor term collapses to an unvalidated constant, and since children spend roughly 70–80% of time indoors, that constant dominates the index.** This is the single highest-leverage set of questions in the instrument.

`C_source` is driven by gas cooking (dominant indoor NO₂ source), secondhand smoke and vaping (dominant indoor PM2.5 source), candles/incense, and dampness. Air purifier use enters as a negative term.

### 2.3 Time-weighting refinement: inhaled dose

A plain time-weighted average treats an hour of sleep as equivalent to an hour of soccer. It is not — inhaled dose scales with ventilation rate:

```
Dose_i = Σ_j ( t_ij × C_ij × VR_j )
```

Two variables carry this: `ta_out_time` (time-of-day of outdoor activity) and `ta_sports_hrs` / `ta_sports_time`. Time-of-day matters independently because ozone peaks sharply between 2 and 6 PM — a child with afternoon outdoor sports has a materially different ozone exposure from one with the same outdoor hours in the morning, and your hourly EPA/TCEQ data resolves this directly.

Recommend constructing both a base time-weighted IEI and a ventilation-adjusted variant, and reporting the correlation. That comparison is itself a defensible contribution for Manuscript 2.

### 2.4 Mapping to the ambient pipeline

Every `C_ambient` term resolves against the existing kriged surfaces (5 km grid, UTM Zone 14N, ordinary kriging with LOOCV) built in Notebook 3 of the South Texas AQ pipeline. The instrument's only job on the outdoor side is supplying **geocodable addresses** and **time weights**. That is why school address is non-negotiable — without it, roughly 30–35 hours per week get assigned the home address concentration by default, which is a silent, systematic, and unquantified misclassification.

---

## 3. Design decisions worth knowing

**Prefix `ta_` on every field.** Guarantees zero collision with existing BREATHE-CC variables, which matters since the dictionary hasn't been reconciled yet. Also makes the thesis-specific subset trivially separable at export.

**`ta_period` as a radio rather than a separate instrument.** One instrument fields both the school-year and summer schedule. Map it to two events (or make it a repeating instrument) rather than building two forms. If you field school-year now and summer next June, the same approved instrument covers both — no second modification.

**Hour buckets rather than derived anchor times.** REDCap's `datediff` on time fields is workable but brittle across midnight and irregular schedules. Direct numeric entry with a live total and a soft warning is more robust and, in practice, more accurate.

**`@DEFAULT="0"` on every hour field.** REDCap calc fields return blank if *any* referenced field is blank, so branched-hidden fields would otherwise null out every derived fraction. This is the most common reason time-budget calcs silently fail.

**Soft rather than hard budget validation.** `ta_wd_warn` and `ta_we_warn` display conditionally; `ta_budget_flag` stores a QC indicator. Hard blocks tank completion rates. Flag and follow up instead.

**`@NONEOFTHEABOVE` on `ta_out_time`.** Prevents "rarely outdoors" being checked alongside three time windows.

---

## 4. Gap list

### Dealbreakers — the index cannot be computed without these

| Gap | Fields | Why it breaks the index |
|---|---|---|
| Time budget | `ta_wd_*`, `ta_we_*` | `f_ij` is the entire weighting scheme. No budget, no index. |
| School/childcare address | `ta_school_address` and related | ~30–35 hrs/week otherwise misassigned to the home surface |
| Secondary residence address + nights | `ta_sec_address`, `ta_nights_*` | The skill explicitly specifies time-weighting *across multiple residences*; without this, Aim 2 is not delivered as scoped |
| Infiltration drivers | `ta_ac_type`, `ta_ac_use`, `ta_windows` | Indoor term becomes a constant, and indoor time dominates the budget |
| Period anchor | `ta_period`, `ta_period_start` | Determines which ambient date range to average against |

### High value — index computable but substantially weaker

| Gap | Fields | Note |
|---|---|---|
| Outdoor time-of-day | `ta_out_time`, `ta_sports_time` | Ozone diurnal peak; your data is hourly, so this is nearly free precision |
| Gas cooking ⚠ | `ta_stove_fuel`, `ta_stove_freq`, `ta_hood` | Dominant indoor NO₂ source — may already exist at baseline |
| Secondhand smoke ⚠ | `ta_smoke_indoor`, `ta_vape_indoor`, `ta_smoke_vehicle` | Dominant indoor PM2.5 source — very likely already at baseline |
| Transit | `ta_wd_transit`, `ta_school_mode`, `ta_vehicle_window` | In-vehicle concentrations run well above ambient, especially diesel bus |

### Nice to have — sensitivity analyses and covariates

`ta_purifier`, `ta_hvac_filter`, `ta_home_type`, `ta_home_age`, `ta_candles`, `ta_damp` ⚠, `ta_road`, `ta_industry`, `ta_aqi_check`, `ta_aqi_action`.

`ta_aqi_check` / `ta_aqi_action` deserve a specific note: avoidance behavior attenuates measured exposure *and* correlates with asthma severity. Uncaptured, it is a live reverse-causation pathway in Aim 3. Cheap to measure, expensive to omit.

⚠ = plausibly already collected at BREATHE-CC baseline. Reconcile against the dictionary and delete duplicates before import.

---

## 5. Derived variables

Computed in REDCap for QC visibility; the authoritative IEI is computed in R against the kriged surfaces.

| Field | Definition |
|---|---|
| `ta_wd_total`, `ta_we_total` | Budget sums for validation |
| `ta_frac_outdoor` | `((wd_outdoor_sum × 5) + (we_outdoor_sum × 2)) / 168` |
| `ta_frac_home_indoor` | `((wd_home_indoor × 5) + (we_home_indoor × 2)) / 168` |
| `ta_frac_school_indoor` | `(wd_school_indoor × 5) / 168` |
| `ta_frac_other_indoor` | `((wd_other_indoor × 5) + (we_other_indoor × 2)) / 168` |
| `ta_frac_transit` | `((wd_transit × 5) + (we_transit × 2)) / 168` |
| `ta_budget_flag` | 1 if either daily total falls outside 23–25 hours |

**Known simplification:** the 5/2 weekday-weekend split is hardcoded rather than driven by `ta_school_days`. Children attending 4 days/week are slightly misweighted. This is deliberate — it keeps the REDCap calc readable, and the R pipeline should recompute properly using `ta_school_days`. Document it as a limitation or fix it downstream; don't fix it in REDCap.

---

## 6. IRB considerations

Rank-ordered by likely scrutiny.

**1. Address collection is the main event.** `ta_school_address` and `ta_sec_address` are direct identifiers under HIPAA, flagged `Identifier? = y` in the dictionary. Depending on what your approved protocol already covers, this may require a consent addendum rather than a simple modification — which is the difference between a two-week and a six-week turnaround. Check the approved consent language for geocoding and address collection *before* you submit; if home address geocoding is already covered, argue school address as the same category of data for the same purpose.

Mitigation to offer proactively: geocode on receipt, store coordinates in a separate restricted table, retain raw addresses only as long as needed for geocoding QC.

**2. Pattern-of-life data on minors.** A complete weekly schedule for a child — where they are, when — is more sensitive in aggregate than any single item. Address it directly in the modification: state access controls, state that no real-time or GPS data is collected, state that all analysis is at the group level.

**3. Smoking and vaping items.** Standard in pediatric asthma research and unlikely to be blocked, but expect a question about caregiver discomfort or perceived judgment. Confirm your protocol contains no mandated-reporting trigger tied to these responses, and keep them non-required (they are).

**4. Custody and multi-household structure.** `ta_multi_residence` touches family arrangements some families consider private. Non-required, neutrally worded, no reason for the split requested.

**5. Added burden.** State the number: approximately 6 minutes median, 74 fields with roughly 45 seen by a typical single-residence respondent due to branching.

**6. Spanish translation.** The branding Skill specifies bilingual participant communications, and given the cohort your IRB will almost certainly expect a Spanish version submitted alongside the English. **Start translation now, in parallel with drafting the modification** — it is the most common cause of avoidable delay on a submission like this, and it is entirely schedulable.

---

## 7. Suggested sequence

1. Export the BREATHE-CC data dictionary; reconcile the ⚠ fields and delete duplicates
2. Check approved consent language for address/geocoding coverage → determines modification vs. addendum
3. Commission Spanish translation in parallel
4. Import to a REDCap **development copy**, test branching and every calc field end to end
5. Confirm `@DEFAULT="0"` is holding — leave one hour field blank and verify the fractions still compute
6. Submit modification with instrument PDF, both languages, and a short methodological justification
7. On approval: field to all currently enrolled participants; the five-month window starts at first response

On the five-month window — that is a defensible design, not a compromise. Contemporaneous schedule reporting is more accurate than retrospective summer recall, and a clearly bounded window is easier to defend in Manuscript 2 than a stitched-together annual estimate. Frame it as a design choice in the methods and state the seasonal-generalizability limitation plainly.
