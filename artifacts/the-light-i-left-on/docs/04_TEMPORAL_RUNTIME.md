# TLILO-ARCH-004

THE LIGHT I LEFT ON · TLILO-001

Version: 0.1.0 · Status: IMPLEMENTATION DRAFT / NOT OWNER-FROZEN

Created: 2026-10-02T13:06:53Z

Foundation: TB-SUB-001 v1.0.0, unchanged. Reality ≠ Representation.

## Schedule
| State | Name | Inclusive lower bound | Upper bound |
|---|---|---|---|
| STATE-00 | DEPARTURE | Departure | Month 2 |
| STATE-01 | TRACE | Month 2 | Month 4 |
| STATE-02 | WEATHERING | Month 4 | Month 6 |
| STATE-03 | RECLAMATION | Month 6 | Month 8 |
| STATE-04 | FOUNDATION | Month 8 | Month 10 |
| STATE-05 | RECONSTRUCTION | Month 10 | Month 12 |
| STATE-06 | DAWN | Month 12 | Unbounded |

Start is a recorded owner-confirmed actual departure timestamp in UTC. It is presently null. Months are UTC calendar anniversaries retaining time of day and clamping to the destination month's final day. They are not fixed 30-day periods. Offsets are an implementation draft choice, not retroactively declared owner canon.

## Function
validate(config) → evaluate(config, deviceTime) → select asset → project view → expose current represented state. Missing record returns STATE-00/UNSTARTED. Clock before departure returns STATE-00/BEFORE_DEPARTURE. Invalid clock is bounded. After twelve months DAWN persists indefinitely. Completion never changes returnEvent.

Evaluation runs on load, once per minute and on becoming visible. It skips intermediate phases if a visitor returns after a long absence. No scheduled external updates, automation, server cron or monthly author work. A hidden browser tab may pause timers; visible-page re-evaluation corrects its displayed phase.

## Clock ceiling
Device time is user-controlled and unverified. A visitor may see a different phase with a mis-set clock. Clock rollback may display an earlier phase; this is render recalculation, not rewritten history. There is no trusted global consensus clock. Adding one would introduce a dependency and require a separately authorized successor design.

Review.html deliberately exposes all phases for review. Production query parameters cannot override the phase. Once sealed, review.html is removed. Future asset bytes still remain technically discoverable in a static release; mystery is an artistic interface choice, not confidentiality.

