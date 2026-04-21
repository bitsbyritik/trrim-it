use anyhow::{anyhow, Context, Result};
use futures_util::StreamExt;
use std::path::PathBuf;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use tokio::process::Command;

pub enum VideoSource {
    YtDlp(String),
    DirectUrl(String),
}

pub fn detect_source(url: &str) -> VideoSource {
    let is_platform = [
        "youtube.com",
        "youtu.be",
        "x.com",
        "twitter.com",
        "tiktok.com",
        "vimeo.com",
        "instagram.com",
        "dailymotion.com",
        "facebook.com",
    ]
    .iter()
    .any(|s| url.contains(s));

    if is_platform {
        VideoSource::YtDlp(url.to_string())
    } else {
        VideoSource::DirectUrl(url.to_string())
    }
}

pub async fn fetch_ytdlp_to_temp(url: &str, temp_path: &PathBuf) -> Result<u64> {
    tracing::debug!(url = %url, path = ?temp_path, "Fetching via yt-dlp");

    let output_path = temp_path
        .to_str()
        .ok_or_else(|| anyhow!("Invalid temp path"))?;

    let output = Command::new("yt-dlp")
        .args([
            "--format",
            "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "--no-playlist",
            "--no-part",
            "--output",
            output_path,
            "--merge-output-format",
            "mp4",
            url,
        ])
        .output()
        .await
        .map_err(|e| anyhow!("yt-dlp not found or failed to start: {e}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        tracing::error!(stderr = %stderr, stdout = %stdout, "yt-dlp failed");
        anyhow::bail!("yt-dlp failed (status {}): {}", output.status, stderr.trim());
    }

    let metadata = tokio::fs::metadata(temp_path)
        .await
        .context("yt-dlp finished but output file not found")?;

    let bytes = metadata.len();
    tracing::debug!(bytes = bytes, "yt-dlp download completed");
    Ok(bytes)
}

pub async fn fetch_video_to_temp(url: &str, temp_path: &PathBuf) -> Result<u64> {
    tracing::debug!(url = %url, path = ?temp_path, "Fetching via direct URL");

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(300))
        .build()?;

    let response = client
        .get(url)
        .send()
        .await
        .context("Failed to connect to source url")?;

    if !response.status().is_success() {
        anyhow::bail!("Source URL returned HTTP {}", response.status());
    }

    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    if !content_type.starts_with("video/") && !content_type.starts_with("application/octet-stream")
    {
        anyhow::bail!(
            "URL does not point to a video file (got content-type: {})",
            content_type
        );
    }

    let mut file = File::create(temp_path)
        .await
        .context("Failed to create temp file")?;

    let mut total_bytes = 0u64;
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.context("Error reading video stream")?;
        file.write_all(&chunk)
            .await
            .context("Failed to write chunk to temp file")?;
        total_bytes += chunk.len() as u64;
    }

    file.flush().await.context("Failed to flush temp file")?;

    tracing::debug!(bytes = total_bytes, "Direct URL fetch completed");
    Ok(total_bytes)
}

pub async fn fetch_to_temp(url: &str, temp_path: &PathBuf) -> Result<u64> {
    match detect_source(url) {
        VideoSource::DirectUrl(u) => fetch_video_to_temp(&u, temp_path).await,
        VideoSource::YtDlp(u) => fetch_ytdlp_to_temp(&u, temp_path).await,
    }
}
