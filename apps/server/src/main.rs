use axum::{routing::get, Router};
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/get", get(|| async {"trrim.it API is Live"}))
        .route("/health", get(|| async {"OK"}));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    println!("🚀 Server running on http://{}", addr);

    let listner = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listner, app).await.unwrap();
}
