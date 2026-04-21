use anyhow::{Context, Result};
use aws_sdk_s3::{primitives::ByteStream, Client};
use std::path::PathBuf;

pub async fn upload_to_r2(
    client: &Client,
    bucket: &str,
    key: &str,
    file_path: &PathBuf,
) -> Result<()> {
    tracing::debug!(key = %key, bucket = %bucket, "Uploading to R2");

    let body = ByteStream::from_path(file_path)
        .await
        .context("Failed to read output file for upload")?;

    client
        .put_object()
        .bucket(bucket)
        .key(key)
        .content_type("video/mp4")
        .body(body)
        .send()
        .await
        .map_err(|e| {
            tracing::error!(key = %key, bucket = %bucket, error = %e, "R2 upload failed");
            anyhow::anyhow!("R2 upload failed: {e}")
        })?;

    tracing::debug!(key = %key, "R2 upload complete");
    Ok(())
}

pub async fn create_r2_client() -> Result<Client> {
    let endpoint = std::env::var("R2_ENDPOINT").context("R2_ENDPOINT env var not set")?;

    let shared_config = aws_config::from_env().endpoint_url(&endpoint).load().await;

    let s3_config = aws_sdk_s3::config::Builder::from(&shared_config)
        .force_path_style(true)
        .build();

    Ok(Client::from_conf(s3_config))
}
