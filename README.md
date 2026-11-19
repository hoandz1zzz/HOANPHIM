# 🎬 HoanPhim - Microservices Movie Streaming Platform

HoanPhim là nền tảng xem phim trực tuyến được xây dựng theo kiến trúc **Microservices Monorepo**, tách biệt hoàn toàn các dịch vụ nghiệp vụ, cơ sở dữ liệu độc lập (**Database-per-Service**), bộ nhớ đệm Redis, giao diện Cinema Dark UI tối ưu cho Desktop & Mobile, và tích hợp **AI RAG Chatbot** tư vấn phim thông minh.

> 🤖 **AI Chatbot Repository (Separate Service):** [Chatbot_Rag_HoanPhim](https://github.com/hoandz1zzz/Chatbot_Rag_HoanPhim)

---

## Kiến trúc hệ thống

```mermaid
flowchart LR
    Client["Frontend<br/>Next.js 14 (Port 3000)"] -->|"HTTP / REST"| Gateway["API Gateway<br/>Express Proxy + JWT Auth (Port 8000)"]
    Client -->|"POST /api/chat"| Chatbot["AI RAG Chatbot<br/>Chatbot_Rag_HoanPhim (Port 8001)"]

    Gateway -->|"/api/auth"| Auth["Auth Service<br/>Express + Prisma (Port 4001)"]
    Gateway -->|"/api/catalog"| Catalog["Catalog Service<br/>Express + Redis (Port 4002)"]
    Gateway -->|"/api/interactions"| Interact["Interaction Service<br/>Express + Prisma (Port 4003)"]

    Auth --> UserDB[("PostgreSQL: user_db<br/>Host 5436 -> 5432")]
    Catalog --> Redis[("Redis Cache<br/>Port 6379")]
    Catalog -->|"External API"| NguonC["NguonC Movie API"]
    Interact --> InterDB[("PostgreSQL: interaction_db<br/>Host 5434 -> 5432")]
    Chatbot --> VectorDB[("pgvector DB<br/>Host 5435 -> 5432")]
```

---

## Các điểm nhấn kỹ thuật

- **API Gateway JWT Injection (`optionalAuth`)**: Xác thực JWT tập trung tại `api-gateway`, tự động giải mã thông tin người dùng (`userId`, `name`, `avatar`), loại bỏ header giả mạo từ client và truyền xuống các downstream services qua `x-user-*` headers.
- **Database-per-Service Pattern & Data Denormalization**: `auth-service` và `interaction-service` sở hữu 2 PostgreSQL database hoàn toàn độc lập. Dữ liệu tương tác (`Watchlist`, `WatchHistory`, `Comment`) được phi chuẩn hóa (`userName`, `userAvatar`, `movieName`, `thumbUrl`) để truy vấn nhanh mà không cần join chéo service.
- **Redis Cache-Aside & Request Aggregation (`Promise.all`)**: `catalog-service` áp dụng chiến lược Cache-Aside với `ioredis` (TTL = 1800s), fail-open khi Redis gián đoạn và retry tự động khi upstream chậm; đồng thời gộp 5 danh sách phim trang chủ qua `Promise.all` tại `/home-feed`.
- **AI Movie Recommendation Chatbot (RAG)**: Tích hợp widget `HoanPhimChatWidget` kết nối tới service [Chatbot_Rag_HoanPhim](https://github.com/hoandz1zzz/Chatbot_Rag_HoanPhim) (`POST /api/chat`, `top_k: 5`), hỗ trợ tư vấn phim theo thể loại/tâm trạng và điều hướng trực tiếp tới trang xem phim.
- **Chunked Episode Pagination (>1.000 tập)**: Bộ chọn tập thông minh chia nhỏ danh sách tập theo từng cụm 100 tập (`1 - 100`, `101 - 200`, ...) kèm ô nhảy nhanh theo số tập, giúp trình duyệt render mượt mà với các bộ anime/phim dài tập như *One Piece* (1.180+ tập).
- **Cinema Dark UI & Responsive Touch UX**: Giao diện lấy cảm hứng từ Netflix với Hero Billboard, Swimlanes vuốt ngang mượt trên mobile, Cinema Mode (tắt đèn khi xem phim) và logo thương hiệu **HOANPHIM** dùng font *Bebas Neue*.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React |
| **API Gateway** | Node.js, Express, `http-proxy-middleware`, `jsonwebtoken`, CORS |
| **Auth Service** | Node.js, Express, TypeScript, Prisma ORM, `bcryptjs`, JWT, PostgreSQL |
| **Catalog Service** | Node.js, Express, TypeScript, `ioredis`, Redis 7 |
| **Interaction Service** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL |
| **AI Chatbot (External Repo)** | [Chatbot_Rag_HoanPhim](https://github.com/hoandz1zzz/Chatbot_Rag_HoanPhim) (RAG + `pgvector`, Port 8001) |
| **Infrastructure** | Docker & Docker Compose (8 containers), PostgreSQL 16 Alpine x2, Redis 7 Alpine |

---

## 📸 Screenshots

| Home Page (Billboard & Swimlanes) | Cinema Player & Chunked Episodes |
| :---: | :---: |
| ![HoanPhim Home](./docs/home.png) | ![HoanPhim Player](./docs/player.png) |

---

## Quick Start

Đảm bảo máy đã cài đặt **Docker Desktop** (và **Node.js >= 18** nếu chạy chế độ Dev local).

### Cách 1: Chạy toàn bộ hệ thống bằng Docker Compose (Khuyên dùng)

Chỉ cần 1 lệnh duy nhất để build và khởi động cả 8 container (Frontend, API Gateway, 3 Backend Services, 2 PostgreSQL + tự động `prisma db push`, và Redis):

```bash
docker compose up -d --build
```

### Cách 2: Chạy ở chế độ Development (Local)

```bash
# 1. Khởi động 2 PostgreSQL databases và Redis Cache
docker compose up -d user-db interaction-db catalog-redis

# 2. Cài đặt dependencies cho toàn bộ Monorepo (Gateway, 3 Services, Frontend)
npm run install-all

# 3. Đồng bộ Prisma schema vào 2 database độc lập
npm run db-push

# 4. Khởi chạy đồng thời tất cả 5 services ở chế độ development
npm run dev
```

*(Tùy chọn) Để sử dụng tính năng AI Chatbot tư vấn phim, clone và chạy thêm repository [Chatbot_Rag_HoanPhim](https://github.com/hoandz1zzz/Chatbot_Rag_HoanPhim) tại cổng `8001` (có thể cấu hình qua biến `NEXT_PUBLIC_AI_API_URL`).*

---

### 🌐 Service Endpoints

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Auth Service**: http://localhost:4001
- **Catalog Service**: http://localhost:4002
- **Interaction Service**: http://localhost:4003
- **AI RAG Chatbot** *(External)*: http://localhost:8001
