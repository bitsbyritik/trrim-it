use axum::Json;
use serde_json::{json, Value};

pub async fn health_handler() -> Json<Value> {
    Json(json!({
    "status": "ok",
    "service": "trrim-media-server",
    "version": env!("CARGO_PKG_VERSION"),
    "ffmpeg": check_ffmpeg_avalable()
    }))
}

pub fn check_ffmpeg_avalable() -> bool {
    std::process::Command::new("ffmpeg")
        .arg("-version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}
