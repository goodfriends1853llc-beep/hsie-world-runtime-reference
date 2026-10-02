# TLILO implementation revision 0.1.1

Status: WORKING CANDIDATE / UNSEALED. Foundation and prior architecture unchanged.

The implementation now rejects impossible UTC calendar dates, mismatched phase images and malformed NORTH destinations. The release preparation tool validates before writing, verifies a temporary staging directory, then renames only after success. An exclusive preparation lock prevents local concurrent preparation. Existing releases are never overwritten through this tool. A process termination may leave a staging folder/lock; inspect the retained evidence before manually removing only that abandoned staging area. This is not tamper-proof filesystem enforcement.

Fallback-mode controls now survive entry. A failed temporal image load is visible, preserves the preceding scene, and retries. The electrical hum stops at DAWN, including if sound is enabled for the first time during that phase.

Validation: 21 local tests pass, including simulated failed preparation, missing media, overwrite refusal, invalid dates and dawn audio state. These are synthetic engineering checks. No real departure or return event was created; all synthetic release files were isolated in temporary directories and removed after testing.

Browser/phone acceptance and visual seam/pole acceptance remain OPEN. The art and seven-phase timetable are unchanged. NORTH and the real departure record remain unrecorded. Final sealing, independent timestamp evidence and public departure publication remain pending.
