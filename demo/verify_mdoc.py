# Independent mdoc check for the playground: reads {"mdoc": base64, "iaca": pem} on stdin,
# verifies the DS certificate chain, the MSO COSE_Sign1 signature and every element digest.
import base64
import json
import logging
import sys

from cryptography import x509
from pymdoccbor.mdoc.verifier import MdocCbor

logging.disable(logging.CRITICAL)
req = json.load(sys.stdin)
root = x509.load_pem_x509_certificate(req["iaca"].encode())
m = MdocCbor()
m.loads(base64.b64decode(req["mdoc"]))
ok = m.verify(trusted_root_certs=[root], verify_hashes=True)
doc = m.documents[0] if m.documents else None
hashes = getattr(doc, "hash_verification", None) or {}
print(json.dumps({
    "valid": ok,
    "chain": "DS certificate signed by the playground IACA" if doc and doc.issuersigned.issuer_auth.verified_root else None,
    "digests": f"{hashes.get('verified', 0)}/{hashes.get('total', 0)} element digests match" if hashes else None,
    "failed": hashes.get("failed", []),
}, default=str))
