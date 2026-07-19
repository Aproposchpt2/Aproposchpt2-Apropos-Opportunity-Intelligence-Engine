# AOIE MASTER BOOTSTRAP

## Apropos Opportunity Intelligence Engine

**Document status:** Authoritative continuity record  
**Owner:** Apropos Group LLC  
**Project Orchestrator:** Jeffery Mitchell  
**Initial scope:** Nevada and California state/local procurement intelligence  
**Future scope:** Additional states, public-sector ecosystems, and cross-portal intelligence

---

## 1. Mandatory Continuity Directive

This document is the authoritative continuity record for the Apropos Opportunity Intelligence Engine.

Before recommending, designing, coding, deploying, or validating changes, every project participant—including AI agents—must:

1. Read this document in full.
2. Read `AOIE_DECISION_LOG.md`.
3. Review `AOIE_REQUIREMENTS_TRACEABILITY_MATRIX.md`.
4. Inspect the current repositories and production sites.
5. Confirm the latest accepted source-of-truth versions.
6. Preserve all approved project-owner decisions unless a later written decision supersedes them.
7. Never claim a change is complete without production verification.

Conversation memory is not the project record. GitHub is the project record.

---

## 2. Mission

AOIE exists to help businesses understand where they can compete successfully in the government marketplace.

The engine must:

- understand what a business actually does;
- translate business language into procurement language;
- interpret fragmented public-sector solicitations;
- identify relevant opportunities across many procurement portals;
- rank opportunities by practical fit;
- explain why each opportunity matched;
- help the business decide whether an opportunity is worth pursuing; and
- provide a professional pathway to Contract Proposal Development when the business is ready to compete.

### Guiding principles

> Opportunity Builds Business. Business Builds Community.

> Technology should adapt to businesses—not force businesses to adapt to technology.

---

## 3. Platform Family

### NGCC — National Government Contract Center

- Production domain: `ngcc.aproposgroupllc.com`
- Federal focus
- Federal profile foundations:
  - UEI
  - CAGE
  - SAM registration
  - NAICS
  - certifications and set-asides
  - federal capability information
- Matching source: federal profile plus federal opportunity data

### NVGovCC — Nevada Government Contract Center

- Production domain: `nvgovcc.aproposgroupllc.com`
- Repository: `Aproposchpt2/nevada-gov-contracts`
- Nevada state and local focus
- Target sources include:
  - Nevada state agencies
  - counties
  - cities
  - municipalities
  - school districts
  - higher education
  - utilities and special districts
  - independent public authorities
  - NEVADAePro and other fragmented procurement systems

### CalGovCC — California Government Contract Center

- Production domain: `calgovcc.aproposgroupllc.com`
- Repository: `Aproposchpt2/CAL-GOV-CONTRACT-CENTER`
- California state and local focus
- Target sources include:
  - California departments
  - counties
  - cities
  - school districts
  - community colleges
  - CSU and UC systems
  - transit agencies
  - water districts
  - utilities and special districts
  - independent procurement portals

### Shared intelligence source

This repository is the authoritative home of the shared AOIE architecture, taxonomies, matching specifications, decision logs, test fixtures, and validation standards.

---

## 4. Problem Statement

Federal procurement has relatively standardized identifiers and classifications. State and local procurement is fragmented.

State and local opportunities may be published across many independent systems with inconsistent:

- portal technology;
- titles and descriptions;
- commodity codes;
- UNSPSC implementation;
- category labels;
- document formats;
- status fields;
- due-date conventions;
- agency terminology; and
- access methods.

Businesses frequently must select broad categories, retrieve all open contracts, and manually inspect large numbers of irrelevant solicitations.

Keywords alone are not sufficient because buyers and businesses often describe the same capability using different language.

AOIE must solve the language and classification problem—not merely aggregate links.

---

## 5. Critical Architectural Separation

### Federal model

```text
SAM.gov Entity Profile
→ UEI / CAGE / NAICS / certifications
→ Federal opportunity matching
→ Personalized federal dashboard
```

### State/local model

```text
Plain-language business intake
→ Structured Business Capability Graph
→ Procurement-language expansion
→ UNSPSC and taxonomy enrichment
→ Multi-source state/local opportunity ingestion
→ Opportunity Understanding Model
→ Eligibility and constraint filtering
→ Hybrid semantic matching
→ Explainable ranked dashboard
```

### Prohibition

Do not transplant the NGCC federal matching model into Nevada or California.

State businesses may not have a federal profile or NAICS-based capability foundation. Their profile must be built from the services and products they actually provide.

---

## 6. AOIE Core Architecture

```text
Business Intake
      ↓
Structured Business Capability Graph
      ↓
Procurement-Language Expansion
      ├─ Services
      ├─ Products
      ├─ Synonyms
      ├─ UNSPSC candidates
      ├─ Buyer terminology
      ├─ Licenses and certifications
      ├─ Markets and facility types
      ├─ Geography
      └─ Capacity constraints
      ↓
Multi-Source Opportunity Ingestion
      ↓
Canonical Opportunity Record
      ↓
Opportunity Understanding Model
      ↓
Eligibility and Hard-Constraint Filter
      ↓
Hybrid Matching Engine
      ├─ Capability similarity
      ├─ Service and product alignment
      ├─ UNSPSC alignment
      ├─ Semantic similarity
      ├─ Keyword evidence
      ├─ Geography
      ├─ Licenses and certifications
      ├─ Capacity and scale
      ├─ buyer/market alignment
      └─ user preference signals
      ↓
Ranked and Explainable Matches
      ↓
Analyze Fit
      ↓
Executive Opportunity Assessment
      ↓
Contract Proposal Development
```

---

## 7. Business Capability Graph

The Business Capability Graph is the authoritative representation of what a state/local business can provide.

### Minimum entities

- Business
- Service
- Product
- Capability
- Industry served
- Buyer/market served
- Facility type
- Equipment or technology
- License
- Certification
- Past project
- Geographic service area
- Workforce capacity
- Contract-size capacity
- Teaming preference
- Exclusion or non-interest

### Minimum relationships

- business provides service;
- business sells product;
- capability supports service;
- service maps to UNSPSC;
- service is synonymous with procurement term;
- business serves market;
- business holds license;
- business holds certification;
- business operates in geography;
- business has relevant past project;
- business can perform contract scale;
- business excludes service/category.

### Intake principle

The business owner should describe the company in normal business language. AOIE should perform the procurement translation.

### Intake categories

1. Services provided
2. Products sold
3. Typical customers
4. Industries and facility types served
5. Licenses
6. Certifications
7. Equipment and technologies
8. Geographic service area
9. Workforce and delivery capacity
10. Typical and maximum contract size
11. Past projects and experience
12. Teaming interests
13. Explicit exclusions

---

## 8. Procurement-Language Expansion

For every approved business service or product, AOIE should derive:

- normalized canonical label;
- synonyms;
- abbreviations;
- trade terminology;
- government buyer terminology;
- related deliverables;
- related equipment/materials;
- related facility types;
- relevant UNSPSC candidates;
- agency-specific commodity-code mappings when available;
- negative terms that indicate false positives.

Example:

```text
Business statement:
Commercial HVAC maintenance

Expanded concepts:
HVAC
heating, ventilation and air conditioning
mechanical systems
preventive maintenance
chiller service
air-handler maintenance
building automation
controls
climate control
equipment replacement
public-facility maintenance
```

The ontology must be versioned and auditable.

---

## 9. Canonical Opportunity Record

Every procurement source must be normalized into a common schema.

### Required fields

- source system
- source URL
- buyer name
- buyer type
- state
- locality
- opportunity ID
- solicitation number
- title
- summary
- full description or extracted text
- posted date
- response deadline
- status
- procurement type
- UNSPSC or commodity codes
- service/product concepts
- licenses/certifications required
- set-aside or preference information
- location of performance
- estimated value when available
- contract term when available
- document links
- source-captured timestamp
- source-updated timestamp
- raw source record

### Data-quality rules

- retain provenance;
- never fabricate missing fields;
- preserve raw source data;
- deduplicate by source identity plus normalized solicitation identity;
- record confidence for extracted fields;
- distinguish explicit facts from inferred concepts.

---

## 10. Opportunity Understanding Model

The engine must convert solicitation text into structured procurement concepts.

### Extract

- required services;
- products/materials;
- trades;
- deliverables;
- facility type;
- buyer/market type;
- licenses;
- certifications;
- insurance/bonding requirements;
- geography;
- delivery schedule;
- staffing requirements;
- contract scale;
- technical complexity;
- proposal complexity;
- teaming indicators;
- mandatory eligibility conditions;
- disqualifying conditions;
- risks and ambiguities.

The Opportunity Understanding Model must retain evidence spans or source references for explainability.

---

## 11. Matching Pipeline

### Stage A — Hard constraints

Remove or strongly suppress opportunities when there is a confirmed mismatch involving:

- closed or expired status;
- geography outside the business service area;
- mandatory license not held;
- mandatory certification not held;
- excluded service/product;
- contract scale beyond configured capacity;
- buyer restriction or mandatory eligibility failure.

Unknown information must not be treated as a confirmed failure.

### Stage B — Candidate retrieval

Retrieve candidates using multiple channels:

- UNSPSC overlap;
- service taxonomy overlap;
- product taxonomy overlap;
- semantic vector similarity;
- keyword and phrase evidence;
- related facility/market concepts;
- buyer-type affinity;
- geography.

### Stage C — Ranking

Initial configurable scoring model:

| Signal | Initial Weight |
|---|---:|
| Core capability/service alignment | 30% |
| Semantic solicitation similarity | 20% |
| UNSPSC/commodity alignment | 15% |
| Product/deliverable alignment | 10% |
| License/certification readiness | 10% |
| Geography and service area | 5% |
| Contract scale/capacity | 5% |
| Market/buyer alignment | 3% |
| User preference/history | 2% |

Weights are provisional and must be calibrated using validation fixtures. They are not permanent business rules.

### Stage D — Confidence

Return both:

- **Fit Score:** estimated alignment between business and opportunity.
- **Confidence:** strength and completeness of the evidence supporting that score.

### Stage E — Explanation

Every match must explain:

- why it matched;
- strongest supporting signals;
- unmet or uncertain requirements;
- potential false-positive risks;
- recommended next action.

A score without an explanation is not an acceptable AOIE output.

---

## 12. Match Status Vocabulary

Recommended dashboard states:

- Strong Match
- Good Match
- Review
- Monitor
- Teaming Opportunity
- Insufficient Information
- Not Recommended

Analyze Fit recommendations:

- Pursue
- Pursue With Conditions
- Monitor
- Do Not Pursue

---

## 13. Continuous Learning Boundaries

AOIE may use user behavior to improve ranking, but it must not silently rewrite authoritative capability facts.

### Permitted preference signals

- viewed opportunity;
- saved opportunity;
- dismissed opportunity;
- requested Analyze Fit;
- pursued opportunity;
- declined opportunity;
- requested proposal support;
- recorded outcome.

### Required safeguards

- preserve explainability;
- separate user preference from objective eligibility;
- allow users to reset or correct preferences;
- never infer protected personal characteristics;
- never reduce access to opportunities solely because prior recommendations were dismissed;
- retain audit history for model/ranking changes.

---

## 14. Commercial Model

The following remain free:

- business profile creation;
- contract discovery;
- opportunity matching;
- personalized dashboard;
- Analyze Fit;
- Executive Opportunity Assessment.

The professional upsell is:

- Contract Proposal Development.

Do not reintroduce subscription, trial, upgrade, premium-access, or payment-gate messaging without explicit written project-owner authorization.

---

## 15. User Experience Rules

- Shared homepage messaging is locked unless explicitly reopened by the Project Owner.
- Do not redesign an approved dashboard when only a content change is authorized.
- Preserve premium visual presence and accessibility.
- Business owners should not need to understand UNSPSC to use the system.
- Every match should be understandable within seconds.
- Advanced analysis should remain available for deeper review.
- Proposal Development should appear as a natural professional next step, not an access gate.

---

## 16. Data Source Strategy

Each state requires a maintained source registry.

### Source registry fields

- source ID
- state
- buyer
- buyer type
- portal URL
- platform/vendor
- access method
- authentication requirement
- scraping/API/feed method
- terms/robots review status
- refresh cadence
- last successful ingestion
- expected record count
- parser version
- health status
- failure-alert channel

### Priority order

1. Official APIs or feeds
2. Official downloadable datasets
3. Official public HTML pages
4. Official procurement documents
5. Browser automation only when required and legally/operationally appropriate

Do not rely on a single statewide portal as complete coverage.

---

## 17. Security, Privacy, and Audit

- Store secrets only in managed environment variables.
- Use token-scoped access for private dashboards and assessments.
- Separate public opportunity data from private business-profile data.
- Log profile, ontology, parser, and model versions used for each match.
- Preserve source provenance and evidence.
- Provide correction paths for inaccurate business profiles.
- Avoid exposing internal prompts, service-role keys, or proprietary scoring internals.

---

## 18. Validation and Acceptance Framework

No portal or engine release is accepted solely because it deploys successfully.

### Validation layers

1. Source ingestion and freshness
2. Canonical record integrity
3. Business profile accuracy
4. Taxonomy and UNSPSC expansion
5. Hard-constraint accuracy
6. Candidate recall
7. Ranking precision
8. Explanation quality
9. Dashboard behavior
10. Analyze Fit quality
11. Executive PDF quality
12. Security and token isolation
13. Desktop/mobile visual acceptance
14. Production monitoring and alerts

### Required validation fixtures

Build a controlled corpus with:

- at least 20 representative business profiles per state;
- multiple industries and trades;
- product suppliers and service providers;
- urban and rural service areas;
- small and larger contract capacities;
- known positive matches;
- known negative matches;
- ambiguous opportunities;
- teaming opportunities;
- solicitations with poor or incomplete descriptions.

### Core metrics

- Recall@K
- Precision@K
- false-positive rate
- false-negative rate
- hard-constraint violation rate
- explanation-support rate
- freshness SLA compliance
- duplicate rate
- user correction rate
- Analyze Fit completion rate

### Acceptance states

- PASS
- PASS WITH CONDITIONS
- FAIL
- BLOCKED BY EXTERNAL DEPENDENCY

---

## 19. Phased Implementation Roadmap

### Phase 0 — Baseline and governance

- Inventory current Nevada and California code.
- Run formal baseline Validation and Acceptance protocols.
- Create source registries.
- Document current schemas and matching logic.
- Freeze approved homepage designs.

### Phase 1 — Shared canonical models

- Define Business Capability Graph schema.
- Define Canonical Opportunity Record schema.
- Define ontology versioning.
- Define source provenance and confidence fields.

### Phase 2 — Business profile builder

- Replace keyword-only profiles with structured intake.
- Preserve existing keywords as migration inputs.
- Generate normalized services, products, synonyms, and UNSPSC candidates.
- Add owner review/correction before profile activation.

### Phase 3 — Opportunity ingestion normalization

- Build state source registries.
- Normalize existing ingesters.
- Add freshness health checks and alerts.
- Retain raw records and parser versions.

### Phase 4 — Hybrid matching MVP

- Implement hard constraints.
- Implement multi-channel candidate retrieval.
- Implement configurable scoring.
- Return score, confidence, and explanation.
- Validate against controlled fixtures.

### Phase 5 — Portal integration

- Integrate AOIE into NVGovCC.
- Integrate AOIE into CalGovCC.
- Preserve portal-specific branding and data sources.
- Standardize dashboard and Analyze Fit handoffs.

### Phase 6 — Learning and outcome feedback

- Add saves, dismissals, pursuits, and outcomes.
- Separate preference learning from eligibility.
- Add audit and reset controls.

### Phase 7 — Expansion

- Add more procurement sources.
- Add additional states.
- Add partner APIs and economic-development organization workflows.

---

## 20. Immediate Next Actions

1. Perform NVGovCC baseline Validation and Acceptance testing.
2. Perform CalGovCC baseline Validation and Acceptance testing.
3. Inventory existing business-profile and keyword logic in both repositories.
4. Inventory every current procurement source and ingestion path.
5. Extract current database schemas.
6. Build the first controlled business/opportunity validation corpus.
7. Approve the Business Capability Graph schema before coding the new matcher.
8. Implement the engine behind feature flags or protected branches.
9. Preserve current production behavior until replacement logic passes acceptance testing.

---

## 21. Future-Agent Handoff Prompt

Use this prompt when beginning a new agent session:

```text
You are joining the Apropos Opportunity Intelligence Engine project.

Before taking action:
1. Read README.md.
2. Read AOIE_BOOTSTRAP.md in full.
3. Read AOIE_DECISION_LOG.md.
4. Read AOIE_REQUIREMENTS_TRACEABILITY_MATRIX.md.
5. Inspect the relevant portal repository and production site.
6. Summarize your understanding of the architecture, current state, constraints, risks, and next approved action.
7. Do not modify production until the Project Owner approves the specific change or an existing authorization clearly covers it.
8. Do not transplant federal NAICS logic into state/local matching.
9. Do not redesign approved interfaces without explicit authorization.
10. Report evidence, commit identifiers, deployment status, and validation results accurately.
```

---

## 22. Definition of Success

AOIE succeeds when a business owner can describe the company naturally and receive a concise, explainable set of government opportunities that genuinely align with the business—without manually learning every portal, classification system, or procurement vocabulary.

The engine should not merely answer:

> What bids are open?

It should answer:

> Which opportunities deserve this business’s attention, why, and what should the business do next?
