//error types
use crate::models::ErrorResponse;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};

#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    ProcessingFailed(String),
    StorageFailed(String),
    Unauthorized,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match self {
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, "BAD_REQUEST", msg),
            AppError::ProcessingFailed(msg) => {
                (StatusCode::INTERNAL_SERVER_ERROR, "PROCESSING_FAILED", msg)
            }
            AppError::StorageFailed(msg) => {
                (StatusCode::INTERNAL_SERVER_ERROR, "STORAGE_FAILED", msg)
            }
            AppError::Unauthorized => (
                StatusCode::UNAUTHORIZED,
                "UNAUTHORIZED",
                "Invalid or missing credentials".to_string(),
            ),
        };

        let body = Json(ErrorResponse {
            error: message,
            code: code.to_string(),
        });
        (status, body).into_response()
    }
}

impl From<anyhow::Error> for AppError {
    fn from(err: anyhow::Error) -> Self {
        AppError::ProcessingFailed(err.to_string())
    }
}
