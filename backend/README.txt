# Tekly Studio – Backend Internship Challenge  
**Cryptocurrency Stats API (Node 22 + Express 5)**

A lightweight REST service that grabs live and historical prices from CoinGecko
and returns concise stats for any crypto symbol.

---

## 📂 API Code & Routing

<details><summary>Key files</summary>

src/
├─ server.js # bootstrap & mount routes
├─ routes/
│ └─ crypto.js # REST endpoints
└─ services/
└─ coingecko.js # CoinGecko client, caching, duplicate-symbol logic
tests/
└─ crypto.test.js # Jest + Supertest integration tests

</details>

* **Endpoints**

| Method / Path | Purpose |
|---------------|---------|
| **GET `/api/price/:symbol`** | Latest USD price, 24 h % change, 24 h volume |
| **GET `/api/historical/:symbol?days=N`** | Average & max closing price over the past *N* days (1 – 365, default 30) |

Duplicate-symbol guard (e.g. **ETH** vs **ETHW**) always picks the highest-market-cap coin.

---

## 🖥️ Example Requests

```bash
# Live BTC snapshot
curl http://localhost:8000/api/price/btc | jq

# 90-day ETH stats
curl "http://localhost:8000/api/historical/eth?days=90" | jq

Typical responses:

// /api/price/btc
{
  "symbol": "BTC",
  "price_usd": 104570,
  "percent_change_24h": -0.10,
  "volume_24h": 23891234231.63
}

// /api/historical/eth?days=90
{
  "symbol": "ETH",
  "days": 90,
  "avg_close_usd": 2375.36,
  "max_close_usd": 2771.23
}

🧪 Tests / Validation Logic

    tests/crypto.test.js spins up an in-memory Express app with Jest 29 and Supertest 7

        /api/price/btc ⇒ 200 OK with JSON body

        /api/price/notacoin ⇒ 502 Bad Gateway

Run them:

npm test

🛠 Tech Stack

    Node 22 LTS – native ES modules ("type":"module")

    Express 5-beta – routing

    Axios – HTTP client

    Node-Cache – in-process caching

    Jest 29 + Supertest 7 – tests

    Nodemon – hot reload in dev

🚀 Run / Test Locally

git clone https://github.com/<your-user>/tekly-crypto-api.git
cd tekly-crypto-api

npm install          # install deps
npm run dev          # dev server → http://localhost:8000

# smoke-test
curl http://localhost:8000/api/price/btc

🌱 What I’d Build Next
Area	Next step
Caching	Replace Node-Cache with Redis for multi-instance resilience
Input validation	Add Zod/Joi schemas → 400 on malformed queries
Docs	Auto-generate OpenAPI + Swagger UI at /docs
Packaging	Dockerfile + GitHub Actions CI
Analytics	Persist queries and allow CSV export / simple dashboard
