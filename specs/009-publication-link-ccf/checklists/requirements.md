# Specification Quality Checklist: Publications 链接修复与 CCF 等级完整标注

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-11-19
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Validation run 2026-11-19: all items pass. No [NEEDS CLARIFICATION] markers.
- Clarifications recorded: Chinese journals use the 2019 CCF Chinese journal catalog (计算机学报/计算机研究与发展 = A, 信息安全学报 = B); CCF ratings switch by publication year (IJCAI A through 2025, B from 2026); official links take precedence over arXiv; missing links are filled when verifiable.
- Official catalog evidence: CCF 2026 (7th version, released 2026-03-31) explicitly excludes Findings/Workshop/Short/Demo/Technical Brief/Summary from ranking; CCF 2022 lists IJCAI as A; CCF 2026 lists IJCAI as B; CCF 2015 lists CIKM/WSDM/ICMR/ICME/ICASSP/TASLP as B.
- Known data defects verified: 4 Chinese entries point to unrelated Hans-publisher articles; EMNLP 2019 "Ranking and Sampling in Open-Domain Question Answering" points to a book DOI. Verified replacements are recorded in the spec.
- Scope boundary: only `url`, `ccf`, and the `date` that must accompany link add/remove may change; titles, authors, venues, years and featured flags are out of scope. Publications layout must not change except removing fake hidden badge/link placeholders.
- Data contract: every URL-bearing entry must have a date; every link-free entry must have no date (consistent with feature 006).
- Expected outcome with the current 135-entry snapshot: CCF-A 66, CCF-B 48, CCF-C 3, no rating 18 (17 Findings + 1 WWW 2015 Companion).
- Verification note: SC-006 uses the rendered page's DOM as the observable surface for the "no fake badge/no fake link text" requirement; this is a content-truthfulness criterion, not a prescription of framework or implementation.
