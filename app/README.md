## 📦 Stack Overview

We use Docker to maintain consistency across development environments. The primary components are:

- **api**: Next.js application
- **db**: Postgres database

---

### Local Development

Uses `Dockerfile.local` for a standard Node.js server:

````sh
docker-compose up

## 🔧 Setup

```bash
# 1. Build the containers
docker-compose build

# 2. Start the api container
docker-compose up
````

### Accessing Services

- Api Documentation: [http://localhost:9000/docs](http://localhost:9000/api)

📁 Project Structure

- app/api - API backend (Next.js)
- app/ui - Frontend UI (Next.js)
- db - Postgres database data and migrations
- docker-compose.yml - Multi-service orchestration
