# Independent SD-JWT VC check for the playground: reads {"presentation", "iaca", "aud", "nonce"} on stdin,
# checks the issuer certificate (x5c) against the mock root, then the issuer signature, the disclosures and
# the key-binding JWT with the OpenWallet Foundation sd-jwt library.
import base64
import json
import sys

from cryptography import x509
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from jwcrypto.jwk import JWK
from sd_jwt.verifier import SDJWTVerifier

req = json.load(sys.stdin)
root = x509.load_pem_x509_certificate(req["iaca"].encode())
chain = None


def issuer_key(iss, header):
    global chain
    leaf = x509.load_der_x509_certificate(base64.b64decode(header["x5c"][0]))
    root.public_key().verify(leaf.signature, leaf.tbs_certificate_bytes, ec.ECDSA(leaf.signature_hash_algorithm))
    chain = f"{leaf.subject.rfc4514_string()} issued by the playground root"
    return JWK.from_pem(leaf.public_key().public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo))


try:
    v = SDJWTVerifier(req["presentation"], issuer_key, req["aud"], req["nonce"])
    claims = v.get_verified_payload()
    print(json.dumps({
        "valid": True,
        "chain": chain,
        "digests": f"Issuer signature, {len(req['presentation'].split('~')) - 2} disclosures and the key-binding JWT (aud, nonce, sd_hash) verified",
        "failed": [],
    }))
except Exception as e:
    print(json.dumps({"valid": False, "chain": chain, "error": f"{type(e).__name__}: {e}"}))
