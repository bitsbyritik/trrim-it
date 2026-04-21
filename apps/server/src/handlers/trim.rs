use axum::{extract::State, Json};
use chrono::Utc;
use std::path::PathBuf;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{TrimRequest, TrimResponse},
    services::{fetcher, storage, trimmer},
    AppState,
};

pub async fn trim_handler(
    State(state): State<AppState>,
    Json(payload): Json<TrimRequest>,
) -> Result<Json<TrimResponse>, AppError> {
    if payload.source_url.is_empty() {
        return Err(AppError::BadRequest("source_url is required".into()));
    }
    if payload.start_time.is_empty() || payload.end_time.is_empty() {
        return Err(AppError::BadRequest(
            "start_time and end_time are required".into(),
        ));
    }

    let job_id = Uuid::new_v4();
    let temp_dir = std::env::temp_dir();
    let input_path = temp_dir.join(format!("{job_id}_input.mp4"));
    let output_path = temp_dir.join(format!("{job_id}_output.mp4"));

    let result = run_trim_job(&state, &payload, &input_path, &output_path).await;

    let _ = tokio::fs::remove_file(&input_path).await;
    let _ = tokio::fs::remove_file(&output_path).await;

    result
}

async fn run_trim_job(
    state: &AppState,
    payload: &TrimRequest,
    input_path: &PathBuf,
    output_path: &PathBuf,
) -> Result<Json<TrimResponse>, AppError> {
    tracing::info!(
        url = %payload.source_url,
        start = %payload.start_time,
        end = %payload.end_time,
        clip_id = %payload.clip_id,
        "Starting trim job"
    );

    fetcher::fetch_to_temp(&payload.source_url, input_path)
        .await
        .map_err(|e| AppError::BadRequest(format!("Failed to fetch video: {e}")))?;

    trimmer::trim_video(input_path, output_path, &payload.start_time, &payload.end_time)
        .await
        .map_err(|e| AppError::ProcessingFailed(format!("ffmpeg trim failed: {e}")))?;

    let duration = trimmer::get_duration(output_path).await.unwrap_or(0.0);

    let file_size = tokio::fs::metadata(output_path)
        .await
        .map(|m| m.len())
        .unwrap_or(0);

    let key = format!("clips/{}/{}.mp4", payload.user_id, payload.clip_id);

    storage::upload_to_r2(&state.r2_client, &state.r2_bucket, &key, output_path)
        .await
        .map_err(|e| AppError::StorageFailed(e.to_string()))?;

    let clip_url = format!("{}/{}", state.r2_public_url.trim_end_matches('/'), key);

    tracing::info!(clip_url = %clip_url, duration = duration, "Trim job complete");

    Ok(Json(TrimResponse {
        clip_url,
        duration_seconds: duration,
        file_size_bytes: file_size,
        processed_at: Utc::now().to_rfc3339(),
    }))
}
