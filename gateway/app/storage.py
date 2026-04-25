from __future__ import annotations

import boto3
from botocore.config import Config

from .config import GatewayConfig

config = GatewayConfig()  # type: ignore[call-arg]

_client = None


def get_r2_client():
    global _client
    if _client is None:
        _client = boto3.client(
            "s3",
            endpoint_url=config.r2_endpoint_url,
            aws_access_key_id=config.r2_access_key_id,
            aws_secret_access_key=config.r2_secret_access_key,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
    return _client


def upload_file(key: str, data: bytes, content_type: str = "application/pdf") -> None:
    get_r2_client().put_object(
        Bucket=config.r2_bucket_name,
        Key=key,
        Body=data,
        ContentType=content_type,
    )


def download_file(key: str) -> bytes:
    response = get_r2_client().get_object(
        Bucket=config.r2_bucket_name,
        Key=key,
    )
    return response["Body"].read()


def delete_file(key: str) -> None:
    get_r2_client().delete_object(
        Bucket=config.r2_bucket_name,
        Key=key,
    )
