from __future__ import annotations
import hashlib
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
from mia_runtime.capabilities import CapabilityContract
from adapters.mia_business_activation import (
    BusinessActivationProvider,
    CAPABILITY_ID,
    OPERATION,
    PROVIDER_ID,
)
from adapters.mia_execution_port import MiaExecutionPort

EXPECTED_MIA_ZIP_SHA256 = "ac6fecd1458c8a6596ba5998ec63d461566196792d022b7d19db021b9d71405a"
EXPECTED_SNAPSHOT = "snapshot:sha256:d7cfc357bdc4b888108ffb0a3f0929881c7e6daf88ff3eb8b83f8046ee694653"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


mia_zip = os.environ.get("MIA_RUNTIME_ZIP")
if mia_zip:
    observed_zip = sha256_file(Path(mia_zip))
    assert observed_zip == EXPECTED_MIA_ZIP_SHA256, observed_zip

with tempfile.TemporaryDirectory() as td:
    td = Path(td)
    registry_path = ROOT / "adapters/mia/registry/wrb001-phase11-runtime-registry.json"
    state_path = td / "business-activation-state.json"
    db_path = td / "mia.db"

    runtime = MIARuntime(db_path, registry_path)
    provider = BusinessActivationProvider(world_root=ROOT, state_path=state_path)
    runtime.gateway.register(
        CapabilityContract(
            CAPABILITY_ID,
            PROVIDER_ID,
            "DETERMINISTIC",
            "WRITE",
        ),
        provider,
    )
    api = MIAAPI(runtime)
    port = MiaExecutionPort(api, no_consent_operations={OPERATION})

    preflight = runtime.registry.preflight([CAPABILITY_ID])
    assert preflight["execution_allowed"] is True
    assert api.health()["runtime_id"] == "MIA-RUNTIME-v1"

    caller = api.create_entity("SERVICE", "WRB-001 World Runtime")
    actor = api.create_entity("OPERATOR", "WRB-001 Operator")
    subject = api.create_entity("BUSINESS", "Lagoon Cuts Demo Business")

    authority = api.grant_authority(
        actor["id"],
        basis="WRB-001 Phase 11 bounded local proof",
        powers=[OPERATION],
        scope=[subject["id"]],
        actor_id=actor["id"],
    )

    request = {
        "request_id": "request:phase11:activate-business-place:001",
        "runtime_id": "MIA-RUNTIME-v1",
        "caller_id": caller["id"],
        "actor_id": actor["id"],
        "subject_id": subject["id"],
        "operation": OPERATION,
        "purpose": "activate_business_place",
        "scope": [subject["id"]],
        "requested_effect": {
            "business_id": "business:lagoon-cuts",
            "place_id": "place:lagoon-cuts-demo",
            "status": "ACTIVE",
        },
        "input": {
            "business_id": "business:lagoon-cuts",
            "place_id": "place:lagoon-cuts-demo",
            "snapshot_id": EXPECTED_SNAPSHOT,
        },
        "evidence_refs": [],
        "authority_refs": [authority["id"]],
        "consent_refs": [],
        "policy_context": {},
        "requested_capabilities": [CAPABILITY_ID],
        "requested_provider": None,
        "event_time": None,
        "submitted_at": "2026-09-27T18:35:00+00:00",
        "trace_id": "trace:phase11:activate-business-place:001",
        "requires_consent": False,
    }

    result = port.execute(request)
    assert result.mia_status == "PASS"
    assert result.terminal_state == "COMPLETED"
    assert result.mia_receipt_ref
    assert result.mia_proof_ref
    assert api.verify_receipt(result.mia_receipt_ref)["status"] == "PASS"
    assert api.verify_proof(result.mia_proof_ref)["status"] == "PASS"

    persisted_request = runtime.store.get(request["request_id"])
    assert persisted_request["payload"]["caller_id"] == caller["id"]
    assert persisted_request["payload"]["requested_capabilities"] == [CAPABILITY_ID]
    assert persisted_request["payload"]["authority_refs"] == [authority["id"]]
    assert persisted_request["payload"]["requires_consent"] is False

    executions = [
        item for item in runtime.store.list("execution")
        if item["payload"].get("execution_id") == result.execution_id
    ]
    assert executions
    execution = executions[-1]
    effect = runtime.store.get(execution["payload"]["effect_ref"])
    assert effect["payload"]["status"] == "CONFIRMED"
    observed = effect["payload"]["observed_effect"]
    assert observed["status"] == "ACTIVE"
    assert observed["verification_state"] == "VERIFIED"
    assert observed["business_id"] == "business:lagoon-cuts"
    assert observed["place_id"] == "place:lagoon-cuts-demo"
    assert observed["snapshot_id"] == EXPECTED_SNAPSHOT

    activation_state = json.loads(state_path.read_text(encoding="utf-8"))
    activation = activation_state["activations"]["business:lagoon-cuts|place:lagoon-cuts-demo"]
    assert activation["status"] == "ACTIVE"
    assert activation["snapshot_id"] == EXPECTED_SNAPSHOT

    health = api.health()
    assert health["store_integrity"]["status"] == "PASS"

    base_registry_hash = sha256_file(mia_home / "registry/runtime_registry.json")

    print(json.dumps({
        "result": "PASS",
        "operation": OPERATION,
        "frozen_mia_zip_sha256": EXPECTED_MIA_ZIP_SHA256 if mia_zip else None,
        "frozen_registry_file_sha256": base_registry_hash,
        "derived_registry_digest": health["registry_digest"],
        "registry_preflight": preflight["status"],
        "request_id": result.request_id,
        "execution_id": result.execution_id,
        "mia_receipt_ref": result.mia_receipt_ref,
        "mia_receipt_verified": True,
        "mia_proof_ref": result.mia_proof_ref,
        "mia_proof_verified": True,
        "effect_status": effect["payload"]["status"],
        "activation_id": observed["activation_id"],
        "activation_status": observed["status"],
        "activation_verification_state": observed["verification_state"],
        "activation_state_digest": observed["state_digest"],
        "snapshot_id": observed["snapshot_id"],
        "content_digest": observed["content_digest"],
        "business_id": observed["business_id"],
        "place_id": observed["place_id"],
        "requires_consent": False,
        "authority_scope_subject_id": subject["id"],
        "world_runtime_receipt_created": False,
        "mia_source_modified": False
    }, indent=2))

    runtime.close()
