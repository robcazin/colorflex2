#!/usr/bin/env python3
"""
Set CORS on Backblaze B2 bucket via S3-Compatible API (so s3.us-east-005.backblazeb2.com returns CORS headers).
Uses boto3; no AWS CLI needed.

Usage:
  source config/local.env   # or export B2_KEY_ID and B2_APPLICATION_KEY
  .venv-b2/bin/python scripts/set-b2-s3-cors.py

Or with explicit env:
  B2_KEY_ID=xxx B2_APPLICATION_KEY=xxx .venv-b2/bin/python scripts/set-b2-s3-cors.py
"""
import os
import sys

try:
    import boto3
    from botocore.config import Config
except ImportError:
    print("boto3 not installed. Run: .venv-b2/bin/pip install boto3", file=sys.stderr)
    sys.exit(1)

BUCKET = "cf-data"
ENDPOINT = "https://s3.us-east-005.backblazeb2.com"
CORS = {
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["Content-Length", "Content-Type"],
            "MaxAgeSeconds": 3600,
        }
    ]
}


def main():
    # Avoid proxy for B2 (Backblaze); proxy often blocks or mis-handles S3 API.
    for var in ("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY", "all_proxy"):
        os.environ.pop(var, None)

    key_id = os.environ.get("B2_KEY_ID") or os.environ.get("B2_APPLICATION_KEY_ID")
    secret = os.environ.get("B2_APPLICATION_KEY")
    if not key_id or not secret:
        print("Set B2_KEY_ID and B2_APPLICATION_KEY (e.g. source config/local.env)", file=sys.stderr)
        sys.exit(1)

    client = boto3.client(
        "s3",
        endpoint_url=ENDPOINT,
        region_name="us-east-005",
        aws_access_key_id=key_id,
        aws_secret_access_key=secret,
        config=Config(signature_version="s3v4"),
    )
    client.put_bucket_cors(Bucket=BUCKET, CORSConfiguration=CORS)
    print("S3 CORS applied to bucket cf-data.")

    # Verify the bucket actually has the rules (confirms put succeeded)
    try:
        out = client.get_bucket_cors(Bucket=BUCKET)
        rules = out.get("CORSRules", [])
        print(f"Verified: bucket has {len(rules)} CORS rule(s).")
        if not rules:
            print("WARNING: No CORS rules on bucket. Check Backblaze console; B2 Native CORS may need to be cleared first.", file=sys.stderr)
    except Exception as e:
        print(f"Could not verify CORS (get_bucket_cors): {e}", file=sys.stderr)

    print("Verify in browser: curl -sI -H \"Origin: https://saffroncottage.shop\" \"https://s3.us-east-005.backblazeb2.com/cf-data/data/collections/geometry/thumbnails/oxbow.jpg\" | grep -i access-control")
    print("You should see Access-Control-Allow-Origin. Then hard-refresh the site (Cmd+Shift+R).")


if __name__ == "__main__":
    main()
