use axum::{
    middleware,
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod error;
mod handlers;
mod middlewares;
mod models;
mod services;

#[derive(Clone)]
pub struct AppState {
    pub r2_client: aws_sdk_s3::Client,
    pub r2_bucket: String,
    pub r2_public_url: String,
}

#[tokio::main]
async fn main() {
    // Load workspace root .env first (apps/server is two levels deep), then local override
    dotenv::from_filename("../../.env").ok();
    dotenv::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "server=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let r2_client = services::storage::create_r2_client()
        .await
        .expect("Failed to create R2 client");

    let r2_bucket = std::env::var("R2_BUCKET").expect("R2_BUCKET env var not set");
    let r2_public_url = std::env::var("R2_PUBLIC_URL").expect("R2_PUBLIC_URL env var not set");

    let state = AppState {
        r2_client,
        r2_bucket,
        r2_public_url,
    };

    let cors = CorsLayer::new()
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_origin(Any);

    let protected = Router::new()
        .route("/trim", post(handlers::trim::trim_handler))
        .route("/protected", get(|| async { "Protected resource" }))
        .layer(middleware::from_fn(
            middlewares::auth::require_internal_token,
        ))
        .with_state(state);

    let public = Router::new()
        .route("/health", get(handlers::health::health_handler))
        .route("/get", get(|| async { "trrim.it server is Live" }));

    let app = Router::new()
        .merge(protected)
        .merge(public)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "3001".to_string())
        .parse()
        .expect("PORT must be a number");

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
