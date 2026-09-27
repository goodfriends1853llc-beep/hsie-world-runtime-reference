from __future__ import annotations
from copy import deepcopy
from dataclasses import dataclass
from typing import Any, Mapping

EXPECTED_RUNTIME_ID = "MIA-RUNTIME-v1"
PHASE_10_BLOCKED_OPERATION = "ACTIVATE_BUSINESS_PLACE"


class MiaExecutionPortError(ValueError):
    code = "MIA_EXECUTION_PORT_ERROR"


class PortValidationError(MiaExecutionPortError):
    code = "PORT_VALIDATION"


class PortRuntimeMismatch(MiaExecutionPortError):
    code = "PORT_RUNTIME_MISMATCH"


class PortPhaseBoundaryError(MiaExecutionPortError):
    code = "PORT_PHASE_BOUNDARY"


@dataclass(frozen=True)
class MiaPortResult:
    request_id: str
    caller_id: str
    runtime_id: str
    mia_status: str
    terminal_state: str
    execution_id: str | None
    mia_receipt_ref: str | None
    mia_proof_ref: str | None
    raw_mia_result: dict[str, Any]

    def as_dict(self) -> dict[str, Any]:
        return {
            "request_id": self.request_id,
            "caller_id": self.caller_id,
            "runtime_id": self.runtime_id,
            "mia_status": self.mia_status,
            "terminal_state": self.terminal_state,
            "execution_id": self.execution_id,
            "mia_receipt_ref": self.mia_receipt_ref,
            "mia_proof_ref": self.mia_proof_ref,
            "raw_mia_result": deepcopy(self.raw_mia_result),
        }


class MiaExecutionPort:
    """
    WRB-001 Phase 10 compatibility boundary for frozen MIA Runtime v1.0.0.

    This port compensates for known v1.0.0 implementation gaps without modifying MIA:
    - caller_id is required here even though v1.0.0 does not independently require it;
    - runtime_id is checked here before MIA overwrites/persists its own runtime identity;
    - plural governed refs are cardinality-checked here before singular compatibility aliases
      are supplied to the v1.0.0 implementation.

    Canonical/plural fields are still forwarded in the request so the frozen runtime's
    persisted ExecutionRequest retains them. Singular aliases exist only for v1.0.0 execution.
    """

    REQUIRED_FIELDS = (
        "request_id",
        "runtime_id",
        "caller_id",
        "actor_id",
        "subject_id",
        "operation",
        "purpose",
        "scope",
        "requested_effect",
        "input",
        "evidence_refs",
        "authority_refs",
        "consent_refs",
        "policy_context",
        "requested_capabilities",
        "requested_provider",
        "event_time",
        "submitted_at",
        "trace_id",
    )

    def __init__(self, mia_api: Any, *, expected_runtime_id: str = EXPECTED_RUNTIME_ID):
        self.mia_api = mia_api
        self.expected_runtime_id = expected_runtime_id

    @staticmethod
    def _require_nonempty_string(value: Any, field: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise PortValidationError(f"{field} must be a non-empty string")
        return value

    @staticmethod
    def _require_list(value: Any, field: str) -> list[Any]:
        if not isinstance(value, list):
            raise PortValidationError(f"{field} must be a list")
        return value

    @staticmethod
    def _require_dict(value: Any, field: str) -> dict[str, Any]:
        if not isinstance(value, dict):
            raise PortValidationError(f"{field} must be an object")
        return value

    def validate(self, governed_request: Mapping[str, Any]) -> None:
        if not isinstance(governed_request, Mapping):
            raise PortValidationError("governed_request must be an object")

        missing = [field for field in self.REQUIRED_FIELDS if field not in governed_request]
        if missing:
            raise PortValidationError("missing required port field(s): " + ", ".join(missing))

        for field in ("request_id", "runtime_id", "caller_id", "actor_id", "operation", "purpose", "submitted_at", "trace_id"):
            self._require_nonempty_string(governed_request[field], field)

        if governed_request["subject_id"] is not None:
            self._require_nonempty_string(governed_request["subject_id"], "subject_id")

        if governed_request["runtime_id"] != self.expected_runtime_id:
            raise PortRuntimeMismatch(
                f"runtime_id mismatch: expected {self.expected_runtime_id}, got {governed_request['runtime_id']}"
            )

        if governed_request["operation"] == PHASE_10_BLOCKED_OPERATION:
            raise PortPhaseBoundaryError("ACTIVATE_BUSINESS_PLACE is not authorized in Phase 10")

        scope = self._require_list(governed_request["scope"], "scope")
        evidence_refs = self._require_list(governed_request["evidence_refs"], "evidence_refs")
        authority_refs = self._require_list(governed_request["authority_refs"], "authority_refs")
        consent_refs = self._require_list(governed_request["consent_refs"], "consent_refs")
        capabilities = self._require_list(governed_request["requested_capabilities"], "requested_capabilities")

        self._require_dict(governed_request["requested_effect"], "requested_effect")
        self._require_dict(governed_request["input"], "input")
        policy_context = self._require_dict(governed_request["policy_context"], "policy_context")

        if not scope:
            raise PortValidationError("scope must not be empty")
        if any(not isinstance(x, str) or not x for x in evidence_refs):
            raise PortValidationError("evidence_refs must contain only non-empty strings")
        if len(authority_refs) != 1:
            raise PortValidationError("frozen MIA v1.0.0 mapping requires exactly one authority_ref")
        if len(capabilities) != 1:
            raise PortValidationError("frozen MIA v1.0.0 mapping requires exactly one requested_capability")

        subject_id = governed_request["subject_id"]
        if subject_id is not None and len(consent_refs) != 1:
            raise PortValidationError("subject-scoped frozen MIA v1.0.0 mapping requires exactly one consent_ref")
        if subject_id is None and consent_refs:
            raise PortValidationError("consent_refs must be empty when subject_id is null")

        for field, values in (
            ("authority_refs", authority_refs),
            ("consent_refs", consent_refs),
            ("requested_capabilities", capabilities),
        ):
            if any(not isinstance(x, str) or not x for x in values):
                raise PortValidationError(f"{field} must contain only non-empty strings")

        if governed_request["requested_provider"] is not None:
            raise PortValidationError(
                "requested_provider must be null for frozen v1.0.0 because provider selection is capability-bound"
            )

        if policy_context:
            raise PortValidationError(
                "policy_context must be empty in Phase 10 because frozen v1.0.0 does not consume caller-supplied policy context"
            )

    def _assert_connected_runtime(self) -> None:
        health = self.mia_api.health()
        runtime_id = health.get("runtime_id") if isinstance(health, dict) else None
        if runtime_id != self.expected_runtime_id:
            raise PortRuntimeMismatch(
                f"connected MIA runtime mismatch: expected {self.expected_runtime_id}, got {runtime_id}"
            )

    def map_request(self, governed_request: Mapping[str, Any]) -> dict[str, Any]:
        self.validate(governed_request)
        mapped = deepcopy(dict(governed_request))

        mapped["capability_id"] = governed_request["requested_capabilities"][0]
        mapped["authority_id"] = governed_request["authority_refs"][0]

        if governed_request["consent_refs"]:
            mapped["consent_id"] = governed_request["consent_refs"][0]

        mapped["requires_consent"] = governed_request["subject_id"] is not None
        return mapped

    def execute(self, governed_request: Mapping[str, Any]) -> MiaPortResult:
        self._assert_connected_runtime()
        mapped = self.map_request(governed_request)
        result = self.mia_api.execute(mapped)

        if not isinstance(result, dict):
            raise MiaExecutionPortError("MIA execute returned a non-object result")

        if result.get("request_id") != governed_request["request_id"]:
            raise MiaExecutionPortError("MIA result request_id does not match port request_id")

        return MiaPortResult(
            request_id=governed_request["request_id"],
            caller_id=governed_request["caller_id"],
            runtime_id=self.expected_runtime_id,
            mia_status=str(result.get("status")),
            terminal_state=str(result.get("terminal_state")),
            execution_id=result.get("execution_id"),
            mia_receipt_ref=result.get("receipt_id"),
            mia_proof_ref=result.get("proof_id"),
            raw_mia_result=deepcopy(result),
        )
