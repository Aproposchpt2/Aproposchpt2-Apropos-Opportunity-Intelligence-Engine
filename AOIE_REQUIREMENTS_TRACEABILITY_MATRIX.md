# AOIE REQUIREMENTS TRACEABILITY MATRIX

**Status legend:** Proposed · Approved · In Progress · Implemented · Validated · Accepted · Blocked

| ID | Requirement | Business Objective | Primary Component | Validation Method | Status |
|---|---|---|---|---|---|
| AOIE-001 | Maintain one authoritative shared architecture for federal, Nevada, California, and future portals. | Prevent divergent and contradictory matching systems. | AOIE core repository | Documentation and repository review | Approved |
| AOIE-002 | Keep federal profile matching distinct from state/local capability matching. | Avoid forcing NAICS/SAM assumptions onto state businesses. | Portal adapters and profile models | Architecture review and regression tests | Approved |
| AOIE-003 | Build a structured Business Capability Graph from plain-language intake. | Understand what the business actually provides. | Profile Builder | Fixture-based profile accuracy testing | Proposed |
| AOIE-004 | Capture services, products, markets, facility types, equipment, licenses, certifications, geography, experience, capacity, teaming preferences, and exclusions. | Produce a complete and useful state/local profile. | Business Capability Graph schema | Schema tests and owner review | Proposed |
| AOIE-005 | Generate normalized procurement terms, synonyms, abbreviations, related deliverables, and negative terms. | Bridge vocabulary differences between businesses and buyers. | Procurement Ontology | Mapping precision review | Proposed |
| AOIE-006 | Generate and validate UNSPSC candidates from business capabilities. | Use UNSPSC without making businesses learn the code system. | UNSPSC Mapper | Expert-reviewed positive/negative fixtures | Proposed |
| AOIE-007 | Maintain a versioned and auditable capability ontology. | Preserve reproducibility and controlled improvement. | Ontology Registry | Version and migration tests | Proposed |
| AOIE-008 | Normalize every source into a Canonical Opportunity Record. | Compare opportunities consistently across fragmented portals. | Ingestion Normalizer | Schema conformance tests | Proposed |
| AOIE-009 | Preserve official source URL, source identity, raw data, capture timestamp, and parser/model versions. | Ensure provenance and auditability. | Ingestion and storage | Record-level provenance tests | Approved |
| AOIE-010 | Maintain a source registry for agencies, counties, cities, municipalities, schools, universities, transit, utilities, and special districts. | Achieve meaningful state/local coverage. | Source Registry | Coverage audit | Proposed |
| AOIE-011 | Monitor source freshness and alert on silent ingestion failures. | Prevent stale opportunity dashboards. | Pipeline Health Monitor | Simulated stale-pipeline test | Proposed |
| AOIE-012 | Extract required capabilities, deliverables, licenses, certifications, geography, schedule, scale, complexity, and risk from solicitations. | Understand the work and eligibility requirements. | Opportunity Understanding Model | Annotated corpus evaluation | Proposed |
| AOIE-013 | Retain evidence spans or references for extracted opportunity concepts. | Support explainable recommendations. | Opportunity Understanding Model | Evidence-support rate | Proposed |
| AOIE-014 | Apply confirmed hard constraints before soft ranking. | Avoid recommending ineligible or impossible opportunities. | Eligibility Filter | Hard-constraint violation rate | Approved |
| AOIE-015 | Treat unknown requirements as unknown—not automatic failures. | Avoid unnecessary false negatives. | Eligibility Filter | Ambiguous-fixture testing | Approved |
| AOIE-016 | Retrieve candidates through UNSPSC, taxonomy, semantic, keyword, market, buyer, and geography channels. | Maximize relevant opportunity recall. | Candidate Retrieval | Recall@K | Proposed |
| AOIE-017 | Rank candidates using configurable, versioned signal weights. | Improve relevance while preserving calibration control. | Ranking Engine | Precision@K and calibration tests | Proposed |
| AOIE-018 | Separate Fit Score from Confidence. | Communicate alignment and evidence certainty accurately. | Ranking and Explanation Engine | Scenario testing | Approved |
| AOIE-019 | Explain why every opportunity matched. | Build user trust and accelerate review. | Explanation Engine | Explanation-support rate and human review | Approved |
| AOIE-020 | Identify uncertain, missing, or conflicting requirements. | Prevent false confidence. | Explanation and Analyze Fit | Ambiguity fixture testing | Proposed |
| AOIE-021 | Identify potential teaming opportunities. | Help businesses pursue work beyond individual capacity. | Ranking and Analyze Fit | Teaming scenario tests | Proposed |
| AOIE-022 | Provide Strong Match, Good Match, Review, Monitor, Teaming Opportunity, Insufficient Information, and Not Recommended states. | Make dashboards scannable and actionable. | Dashboard Adapter | UX validation | Proposed |
| AOIE-023 | Preserve free profile creation, discovery, matching, dashboard access, Analyze Fit, and Executive Opportunity Assessment. | Support the approved economic-opportunity mission. | All portals | Commercial-language audit | Approved |
| AOIE-024 | Present Contract Proposal Development as the professional service. | Monetize expertise without gating opportunity access. | Portal and report CTAs | UX and content validation | Approved |
| AOIE-025 | Do not reintroduce subscription, trial, or upgrade gates without written authorization. | Protect the approved business model. | All portals | Repository-wide content audit | Approved |
| AOIE-026 | Keep shared homepage messaging and approved visual presentation locked unless explicitly reopened. | Prevent scope drift and UX regressions. | Portal presentation layer | Visual regression review | Approved |
| AOIE-027 | Protect private profiles and assessments with token-scoped or authenticated access. | Preserve customer confidentiality. | Security Layer | Cross-account access tests | Proposed |
| AOIE-028 | Separate public opportunity data from private business data. | Reduce security and privacy risk. | Data Architecture | Permission and access tests | Proposed |
| AOIE-029 | Log profile, ontology, parser, model, and ranking versions used for each match. | Ensure reproducibility and auditability. | Match Audit Record | Record completeness tests | Proposed |
| AOIE-030 | Allow users to correct their business profile and exclusions. | Keep matching grounded in accurate business facts. | Profile Management | Edit and re-match tests | Proposed |
| AOIE-031 | Allow preference learning from views, saves, dismissals, pursuits, proposal requests, and outcomes. | Improve personalized ranking over time. | Preference Model | Controlled behavior tests | Proposed |
| AOIE-032 | Keep preference learning separate from objective eligibility. | Prevent personalization from hiding valid opportunity access. | Preference and Eligibility Models | Regression and fairness tests | Approved |
| AOIE-033 | Allow users to reset or correct learned preferences. | Preserve user control. | Preference Management | Reset tests | Proposed |
| AOIE-034 | Validate the engine against representative positive, negative, ambiguous, and teaming fixtures. | Prove practical match quality before deployment. | Validation Corpus | Precision, recall, and human acceptance | Approved |
| AOIE-035 | Perform baseline Validation and Acceptance testing on NVGovCC before replacement work. | Establish the current source of truth and defect register. | NVGovCC | Formal protocol | Next Action |
| AOIE-036 | Perform baseline Validation and Acceptance testing on CalGovCC before replacement work. | Establish the current source of truth and defect register. | CalGovCC | Formal protocol | Next Action |
| AOIE-037 | Inventory current profile, keyword, source, schema, and matching logic in both state repositories. | Avoid destroying useful existing work. | Discovery and Architecture | Repository assessment | Next Action |
| AOIE-038 | Develop replacement logic on protected branches or behind feature flags. | Prevent production regressions. | Engineering Governance | Branch/deployment review | Approved |
| AOIE-039 | Require production verification before declaring changes complete. | Maintain trustworthy project reporting. | Release Governance | Deployment and live-test evidence | Approved |
| AOIE-040 | Maintain source-of-truth documentation in GitHub rather than conversation memory. | Ensure durable continuity across agents and sessions. | Governance Repository | Documentation review | Accepted |

## Initial Acceptance Gates

The first AOIE matching MVP must not be promoted into NVGovCC or CalGovCC until it demonstrates:

1. No confirmed hard-constraint violations in the acceptance corpus.
2. Materially better precision than the current keyword-only baseline.
3. Acceptable recall for known positive opportunities.
4. Evidence-backed explanations for every displayed match.
5. No duplicate or expired opportunities in the displayed set.
6. Current source freshness within each source's approved SLA.
7. Secure isolation of private business profiles.
8. Desktop and mobile UX acceptance.
9. Project Owner approval.

## Evidence Practice

As implementation begins, add the following to each row:

- repository and file path;
- branch or commit;
- test ID;
- test result;
- evidence link;
- acceptance date;
- accepting authority.
