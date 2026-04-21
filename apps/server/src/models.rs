use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct TrimRequest {
    pub source_url: String,
    pub start_time: String,
    pub end_time: String,
    #[serde(rename = "userId")]
    pub user_id: String,
    pub clip_id: String,
}

#[derive(Deserialize, Serialize)]
pub struct TrimResponse {
    pub clip_url: String,
    pub duration_seconds: f64,
    pub file_size_bytes: u64,
    pub processed_at: String,
}

#[derive(Deserialize, Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub code: String,
}
