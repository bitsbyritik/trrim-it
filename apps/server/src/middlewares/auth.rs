use axum::{
    body::Body,
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
};

pub async fn require_internal_token(
    req: Request<Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    let expected = std::env::var("INTERNAL_TOKEN").unwrap_or_else(|_| {
        tracing::warn!("INTERNAL TOKEN not set - all requests allowed");
        "dev-token".to_string()
    });

    let token = req
        .headers()
        .get("x-internal-token")
        .and_then(|v| v.to_str().ok());

    match token {
        Some(token) if token == expected => Ok(next.run(req).await),
        _ => {
            tracing::warn!("Rejected request - invalid internal token");
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}
