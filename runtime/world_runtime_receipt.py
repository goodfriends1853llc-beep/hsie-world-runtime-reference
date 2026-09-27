from __future__ import annotations
import hashlib
import json
from copy import deepcopy
from pathlib import Path
from typing import Any

from adapters.mia_business_activation import canonical_json


WORLD_RECEIPT_CLASS = "WORLD_RUNTIME_RECEIPT"
WORLD_ISSUER = "WRB-001-WORLD-RUNTIME"


class WorldRuntimeReceiptError(ValueError):
    pass


def _sha256(value: Any) -> str:
    return "sha256:" + hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


class WorldRuntimeReceiptEngine:
    def __init__(self, journal_path: str | Path):
        self.journal_path = Path(journal_path).resolve()

    def _records(self) -> list[dict[str, Any]]:
        if not self.journal_path.exists():
            return []
        text = self.journal_path.read_text(encoding="utf-8")
        if not text.strip():
            return []
        records = []
        for index, line in enumerate(text.rstrip().splitlines(), start=1):
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError as exc:
                raise WorldRuntimeReceiptError(
                    f"corrupt World Runtime receipt journal line {index}: {exc}"
                ) from exc
        return records

    def get(self, receipt_id: str) -> dict[str, Any] | None:
        for record in self._records():
            if record.get("receipt_id") == receipt_id:
                return record
        return None

    def _append(self, record: dict[str, Any]) -> None:
        self.journal_path.parent.mkdir(parents=True, exist_ok=True)
        with self.journal_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")
            handle.flush()

    def issue(
        self,
        *,
        request_ref: str,
        execution_ref: str,
        issued_at: str,
        payload_ref: str,
        mia_execution_ref: str,
        mia_receipt_ref: str,
        mia_proof_ref: str,
        activation_state_digest: str,
        snapshot_id: str,
        verified_by: str = WORLD_ISSUER,
        mia_receipt_verified: bool,
        mia_proof_verified: bool,
        activation_verified: bool,
    ) -> dict[str, Any]:
        required = {
            "request_ref": request_ref,
            "execution_ref": execution_ref,
            "issued_at": issued_at,
            "payload_ref": payload_ref,
            "mia_execution_ref": mia_execution_ref,
            "mia_receipt_ref": mia_receipt_ref,
            "mia_proof_ref": mia_proof_ref,
            "activation_state_digest": activation_state_digest,
            "snapshot_id": snapshot_id,
            "verified_by": verified_by,
        }
        for field, value in required.items():
            if not isinstance(value, str) or not value:
                raise WorldRuntimeReceiptError(f"{field} must be a non-empty string")

        if not (mia_receipt_verified and mia_proof_verified and activation_verified):
            raise WorldRuntimeReceiptError("receipt cannot be issued before all required verification gates pass")

        core = {
            "receipt_class": WORLD_RECEIPT_CLASS,
            "issuer_system": WORLD_ISSUER,
            "request_ref": request_ref,
            "execution_ref": execution_ref,
            "verification_state": "VERIFIED",
            "issued_at": issued_at,
            "payload_ref": payload_ref,
            "verification_scope": [
                "WORLD_REQUEST_LINK",
                "MIA_EXECUTION_REFERENCE",
                "MIA_RECEIPT_REFERENCE",
                "MIA_PROOF_REFERENCE",
                "ACTIVATION_STATE_READBACK",
                "SEMANTIC_SNAPSHOT_BINDING",
            ],
            "verified_by": verified_by,
            "evidence_refs": {
                "mia_execution_ref": mia_execution_ref,
                "mia_receipt_ref": mia_receipt_ref,
                "mia_proof_ref": mia_proof_ref,
                "activation_state_digest": activation_state_digest,
                "snapshot_id": snapshot_id,
            },
        }
        integrity_ref = _sha256(core)
        receipt_id = "world-receipt:" + _sha256(
            {
                "request_ref": request_ref,
                "execution_ref": execution_ref,
                "payload_ref": payload_ref,
                "integrity_ref": integrity_ref,
            }
        ).removeprefix("sha256:")

        record = {
            "receipt_id": receipt_id,
            **core,
            "integrity_ref": integrity_ref,
        }

        existing = self.get(receipt_id)
        if existing:
            if canonical_json(existing) != canonical_json(record):
                raise WorldRuntimeReceiptError("receipt identity conflict")
            return deepcopy(existing)

        self._append(record)
        return deepcopy(record)

    def verify(self, receipt_id: str) -> dict[str, Any]:
        record = self.get(receipt_id)
        if not record:
            return {"status": "FAIL", "receipt_id": receipt_id, "errors": ["not_found"]}

        errors = []
        if record.get("receipt_class") != WORLD_RECEIPT_CLASS:
            errors.append("wrong_receipt_class")
        if record.get("issuer_system") != WORLD_ISSUER:
            errors.append("wrong_issuer_system")
        if not str(record.get("receipt_id", "")).startswith("world-receipt:"):
            errors.append("wrong_receipt_id_namespace")

        core = {
            key: deepcopy(value)
            for key, value in record.items()
            if key not in {"receipt_id", "integrity_ref"}
        }
        if record.get("integrity_ref") != _sha256(core):
            errors.append("integrity_mismatch")

        return {
            "status": "PASS" if not errors else "FAIL",
            "receipt_id": receipt_id,
            "receipt_class": record.get("receipt_class"),
            "errors": errors,
        }
