# Apropos Opportunity Intelligence Engine (AOIE)

**Owner:** Apropos Group LLC  
**Project Orchestrator:** Jeffery Mitchell  
**Status:** Architecture and bootstrap established  
**Repository Role:** Authoritative source of truth for the shared opportunity-matching intelligence used by the National, Nevada, California, and future Government Contract Centers.

## Mission

AOIE helps businesses understand where they can compete successfully in the government marketplace.

It translates plain-language business capabilities into procurement language, interprets fragmented government solicitations, ranks relevant opportunities, explains why each match exists, and supports informed pursuit decisions.

## Platform Family

- **NGCC — National Government Contract Center**  
  Federal opportunity intelligence using SAM.gov entity data, UEI, CAGE, NAICS, federal registrations, certifications, and federal opportunity sources.

- **NVGovCC — Nevada Government Contract Center**  
  Nevada state and local opportunity intelligence across state agencies, counties, cities, municipalities, school districts, universities, special districts, and fragmented procurement portals.

- **CalGovCC — California Government Contract Center**  
  California state and local opportunity intelligence across state departments, counties, cities, school districts, community colleges, universities, transit authorities, water districts, and other public buyers.

## Critical Architectural Rule

The state systems must **not** copy the federal matching model.

Federal matching is anchored in SAM.gov profiles and NAICS. Nevada and California matching must be anchored in a structured **Business Capability Graph**, enriched with UNSPSC, semantic procurement-language translation, licenses, certifications, geography, capacity, and explainable scoring.

## Authoritative Documents

1. [`AOIE_BOOTSTRAP.md`](AOIE_BOOTSTRAP.md) — continuity, architecture, implementation roadmap, and agent instructions.
2. [`AOIE_REQUIREMENTS_TRACEABILITY_MATRIX.md`](AOIE_REQUIREMENTS_TRACEABILITY_MATRIX.md) — requirements mapped to implementation and validation.
3. [`AOIE_DECISION_LOG.md`](AOIE_DECISION_LOG.md) — permanent record of approved decisions.

## Operating Principle

> Technology should adapt to businesses—not force businesses to adapt to procurement terminology.

## Commercial Model

- Business profile creation: **FREE**
- Opportunity discovery: **FREE**
- Opportunity matching: **FREE**
- Analyze Fit: **FREE**
- Contract Proposal Development: **Professional service / upsell**

## Governance

Before recommending, designing, or implementing changes, every contributor—including AI agents—must:

1. Read the bootstrap and decision log.
2. Inspect the current repositories and production behavior.
3. Preserve approved architecture and project-owner decisions.
4. Avoid redesigning approved interfaces without explicit authorization.
5. Validate changes through the documented Validation and Acceptance process.
