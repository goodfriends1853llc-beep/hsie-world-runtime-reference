from __future__ import annotations
import json
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

MIA_HOME = os.environ.get("MIA_RUNTIME_HOME")
if not MIA_HOME:
    raise SystemExit("MIA_RUNTIME_HOME is required")

mia_home = Path(MIA_HOME).resolve()
sys.path.insert(0, str(mia_home))

from mia_runtime import MIARuntime, MIAAPI
from adapters.mia_execution_port import (
    EXPECTED_RUNTIME_ID,
    MiaExecutionPort,
    PortPhaseBoundaryError,
    PortRuntimeMismatch,
    PortValidationError,
)


def make_request(*, caller_id, actor_id, subject_id, authority_id, consent_id):
    return {
        "request_id": "request:phase10:frozen-mia:001",
        "runtime_id": EXPECTED_RUNTIME_ID,
        "caller_id": caller_id,
        "actor_id": actor_id,
        "subject_id": subject_id,
        "operation": "analyze",
        "purpose": "phase10_frozen_mia_port_proof",
        "scope": [subject_id],
        "requested_effect": {},
        "input": {},
        "evidence_refs": [],
        "authority_refs": [authority_id],
        "consent_refs": [consent_id],
        "policy_context": {},
        "requested_capabilities": ["model.sim.a"],
        "requested_provider": None,
        "event_time": None,
        "submitted_at": "2026-09-27T18:20:00+00:00",
        "trace_id": "trace:phase10:frozen-mia:001",
    }


with tempfile.TemporaryDirectory() as td:
    runtime = MIARuntime(Path(td) / "mia.db", mia_home / "registry/runtime_registry.json")
    api = MIAAPI(runtime)
    port = MiaExecutionPort(api)

    caller = api.create_entity("SERVICE", "WRB-001 Local Runtime")
    actor = api.create_entity("PERSON", "Phase 10 Actor")
    authority = api.grant_authority(
        actor["id"],
        basis="phase10-port-proof",
        powers=["analyze"],
        scope=[actor["id"]],
        actor_id=actor["id"],
    )
    consent = api.grant_consent(
        actor["id"],
        purpose="phase10_frozen_mia_port_proof",
        scopes=["analyze"],
        basis="phase10-port-proof",
        actor_id=actor["id"],
    )

    request = make_request(
        caller_id=caller["id"],
        actor_id=actor["id"],
        subject_id=actor["id"],
        authority_id=authority["id"],
        consent_id=consent["id"],
    )

    result = port.execute(request)
    persisted = runtime.store.get(request["request_id"])
    assert persisted is not None
    payload = persisted["payload"]

    assert result.mia_status == "PASS"
    assert result.terminal_state == "COMPLETED"
    assert result.mia_receipt_ref
    assert result.mia_proof_ref
    assert api.verify_receipt(result.mia_receipt_ref)["status"] == "PASS"
    assert api.verify_proof(result.mia_proof_ref)["status"] == "PASS"

    assert payload["caller_id"] == caller["id"]
    assert payload["runtime_id"] == EXPECTED_RUNTIME_ID
    assert payload["authority_refs"] == [authority["id"]]
    assert payload["consent_refs"] == [consent["id"]]
    assert payload["requested_capabilities"] == ["model.sim.a"]
    assert payload["authority_id"] == authority["id"]
    assert payload["consent_id"] == consent["id"]
    assert payload["capability_id"] == "model.sim.a"

    bad_runtime = dict(request)
    bad_runtime["request_id"] = "request:phase10:bad-runtime"
    bad_runtime["runtime_id"] = "WRONG"
    try:
        port.execute(bad_runtime)
        raise AssertionError("wrong runtime_id was not rejected")
    except PortRuntimeMismatch:
        pass

    multi_auth = dict(request)
    multi_auth["request_id"] = "request:phase10:multi-auth"
    multi_auth["authority_refs"] = [authority["id"], "authority:second"]
    try:
        port.execute(multi_auth)
        raise AssertionError("multiple authorities were not rejected")
    except PortValidationError:
        pass

    activate = dict(request)
    activate["request_id"] = "request:phase10:activate-blocked"
    activate["operation"] = "ACTIVATE_BUSINESS_PLACE"
    try:
        port.execute(activate)
        raise AssertionError("ACTIVATE_BUSINESS_PLACE was not blocked")
    except PortPhaseBoundaryError:
        pass

    print(json.dumps({
        "result": "PASS",
        "runtime_id": api.health()["runtime_id"],
        "request_id": result.request_id,
        "execution_id": result.execution_id,
        "mia_receipt_ref": result.mia_receipt_ref,
        "mia_receipt_verified": True,
        "mia_proof_ref": result.mia_proof_ref,
        "mia_proof_verified": True,
        "persisted_caller_id": payload["caller_id"],
        "canonical_plural_fields_preserved": True,
        "singular_v1_aliases_added": True,
        "wrong_runtime_rejected_by_port": True,
        "multiple_authorities_rejected_by_port": True,
        "activate_business_place_blocked_in_phase10": True,
        "world_runtime_receipt_created": False
    }, indent=2))

    runtime.close()
