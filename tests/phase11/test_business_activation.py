import json
import tempfile
import unittest
from pathlib import Path

from adapters.mia_business_activation import (
    ActivationCatalog,
    BusinessActivationError,
    BusinessActivationProvider,
    CAPABILITY_ID,
    OPERATION,
)
from adapters.mia_execution_port import MiaExecutionPort, PortValidationError

ROOT = Path(__file__).resolve().parents[2]
EXPECTED_SNAPSHOT = "snapshot:sha256:24337e36ec4b9be3eb22cf450e6b0fc2d99c70ba0254dc72251d98a89e956752"


class FakeMIAAPI:
    def __init__(self):
        self.calls = []

    def health(self):
        return {"runtime_id": "MIA-RUNTIME-v1"}

    def execute(self, request):
        self.calls.append(request)
        return {
            "status": "PASS",
            "terminal_state": "COMPLETED",
            "request_id": request["request_id"],
            "execution_id": "execution:phase11:stub",
            "receipt_id": "receipt:phase11:stub",
            "proof_id": "proof:phase11:stub",
        }


class Phase11Case(unittest.TestCase):
    def test_catalog_digest_matches_phase6(self):
        catalog = ActivationCatalog(ROOT)
        self.assertEqual(catalog.snapshot_id, EXPECTED_SNAPSHOT)

    def test_provider_activates_and_readback_verifies(self):
        with tempfile.TemporaryDirectory() as td:
            provider = BusinessActivationProvider(world_root=ROOT, state_path=Path(td) / "activation.json")
            first = provider.invoke(
                OPERATION,
                {
                    "business_id": "business:lagoon-cuts",
                    "place_id": "place:lagoon-cuts-demo",
                    "snapshot_id": EXPECTED_SNAPSHOT,
                },
                {},
            )
            self.assertTrue(first["changed"])
            self.assertEqual(first["status"], "ACTIVE")
            self.assertEqual(first["verification_state"], "VERIFIED")

            second = provider.invoke(
                OPERATION,
                {
                    "business_id": "business:lagoon-cuts",
                    "place_id": "place:lagoon-cuts-demo",
                    "snapshot_id": EXPECTED_SNAPSHOT,
                },
                {},
            )
            self.assertFalse(second["changed"])
            self.assertEqual(second["activation_id"], first["activation_id"])

    def test_wrong_snapshot_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            provider = BusinessActivationProvider(world_root=ROOT, state_path=Path(td) / "activation.json")
            with self.assertRaises(BusinessActivationError):
                provider.invoke(
                    OPERATION,
                    {
                        "business_id": "business:lagoon-cuts",
                        "place_id": "place:lagoon-cuts-demo",
                        "snapshot_id": "snapshot:sha256:wrong",
                    },
                    {},
                )

    def test_derived_registry_contains_activation_capability(self):
        reg = json.loads(
            (ROOT / "adapters/mia/registry/wrb001-phase11-runtime-registry.json").read_text(encoding="utf-8")
        )
        caps = {item["capability_id"]: item for item in reg["capabilities"]}
        self.assertIn(CAPABILITY_ID, caps)
        self.assertTrue(caps[CAPABILITY_ID]["active"])

    def test_port_allows_no_consent_only_when_explicitly_configured(self):
        api = FakeMIAAPI()
        request = {
            "request_id": "request:phase11:stub",
            "runtime_id": "MIA-RUNTIME-v1",
            "caller_id": "caller:world-runtime",
            "actor_id": "actor:operator",
            "subject_id": "subject:business",
            "operation": OPERATION,
            "purpose": "activate_business_place",
            "scope": ["subject:business"],
            "requested_effect": {"status": "ACTIVE"},
            "input": {
                "business_id": "business:lagoon-cuts",
                "place_id": "place:lagoon-cuts-demo",
                "snapshot_id": EXPECTED_SNAPSHOT,
            },
            "evidence_refs": [],
            "authority_refs": ["authority:activation"],
            "consent_refs": [],
            "policy_context": {},
            "requested_capabilities": [CAPABILITY_ID],
            "requested_provider": None,
            "event_time": None,
            "submitted_at": "2026-09-27T18:30:00+00:00",
            "trace_id": "trace:phase11:stub",
            "requires_consent": False,
        }

        strict_port = MiaExecutionPort(api)
        with self.assertRaises(PortValidationError):
            strict_port.execute(request)

        phase11_port = MiaExecutionPort(api, no_consent_operations={OPERATION})
        result = phase11_port.execute(request)
        self.assertEqual(result.mia_status, "PASS")
        self.assertEqual(api.calls[-1]["requires_consent"], False)
        self.assertNotIn("consent_id", api.calls[-1])


if __name__ == "__main__":
    unittest.main(verbosity=2)
