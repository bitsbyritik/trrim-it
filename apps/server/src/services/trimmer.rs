use anyhow::{Context, Result};
use std::path::PathBuf;
use tokio::process::Command;

pub async fn trim_video(
    input_path: &PathBuf,
    output_path: &PathBuf,
    start_time: &str,
    end_time: &str,
) -> Result<()> {
    tracing::debug!(
        input = ?input_path,
        output = ?output_path,
        start = %start_time,
        end = %end_time,
        "Running ffmpeg to trim video"
    );

    let result = Command::new("ffmpeg")
        .args([
            "-i",
            input_path.to_str().unwrap(),
            "-ss",
            start_time,
            "-to",
            end_time,
            "-c",
            "copy",
            "-avoid_negative_ts",
            "make_zero",
            "-movflags",
            "+faststart",
            "-y",
            output_path.to_str().unwrap(),
        ])
        .output()
        .await
        .context("Failed to spawn ffmpeg - is it installed?")?;

    if !result.status.success() {
        let stderr = String::from_utf8_lossy(&result.stderr);
        tracing::error!(stderr =  %stderr, "ffmpeg failed");
        anyhow::bail!("ffmpeg failed: {}", stderr);
    }

    tracing::debug!("ffmpeg trim completed successfully");
    Ok(())
}

pub async fn get_duration(file_path: &PathBuf) -> Result<f64> {
    let result = Command::new("ffprobe")
        .args([
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            file_path.to_str().unwrap(),
        ])
        .output()
        .await
        .context("Failed to spawn ffprobe")?;

    let output = String::from_utf8_lossy(&result.stdout);
    let json: serde_json::Value =
        serde_json::from_str(&output).context("Failed to parse ffprobe output")?;

    let duration = json["format"]["duration"]
        .as_str()
        .and_then(|s| s.parse::<f64>().ok())
        .unwrap_or(0.0);

    Ok(duration)
}
