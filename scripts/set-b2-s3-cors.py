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
    print("Verify with:")
    print('  curl -sI -H "Origin: https://saffroncottage.shop" "https://s3.us-east-005.backblazeb2.com/cf-data/data/collections/coverlets/thumbnails/zane-tweed.jpg" | grep -i access-control')
    print("You should see Access-Control-Allow-Origin. Then reload the main site.")


if __name__ == "__main__":
    main()
