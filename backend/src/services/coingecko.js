// src/services/coingecko.js
import axios from "axios";
import NodeCache from "node-cache";

const BASE = "https://api.coingecko.com/api/v3";
const cache = new NodeCache({ stdTTL: 60 * 60 });

const LIST_TTL      = 60 * 60 * 12;  // 12 h
const CAP_TTL       = 60 * 60 * 6;   // 6 h
const CHUNK         = 50;

const PREFERRED_IDS = {
  btc: "bitcoin",
  eth: "ethereum",
  etc: "ethereum-classic",
  ada: "cardano",
  ltc: "litecoin",
  xrp: "ripple",
  sol: "solana",
};

export async function liveStats(symbol) {
  const id = await resolveId(symbol);
  const url =
    `${BASE}/simple/price?ids=${id}` +
    "&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true";
  const { data } = await axios.get(url, { timeout: 10_000 });
  if (!data[id]) throw new Error("Unknown coin symbol");
  return data[id];
}

export async function historical(symbol, days = 30) {
  const id = await resolveId(symbol);
  const url = `${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
  const { data } = await axios.get(url, { timeout: 15_000 });
  return data.prices.map(([ , price]) => price);
}

async function resolveId(symbol) {
  const key = symbol.toLowerCase();
  if (PREFERRED_IDS[key]) return PREFERRED_IDS[key];
  const map = (await getIdMap())[key];
  return map ?? key;
}

async function getIdMap() {
  let map = cache.get("idMap");
  if (map) return map;

  const { data } = await axios.get(`${BASE}/coins/list`, { timeout: 20_000 });
  const buckets = {};
  data.forEach(({ symbol, id }) => {
    const s = symbol.toLowerCase();
    (buckets[s] ??= []).push(id);
  });

  map = {};
  for (const [s, ids] of Object.entries(buckets)) {
    if (PREFERRED_IDS[s]) map[s] = PREFERRED_IDS[s];
    else if (ids.length === 1) map[s] = ids[0];
    else map[s] = await pickCap(ids);
  }

  cache.set("idMap", map, LIST_TTL);
  return map;
}

async function pickCap(ids) {
  const key = `cap:${ids.sort().join(",")}`;
  const cached = cache.get(key);
  if (cached) return cached;

  let best = ids[0], rank = Infinity;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK);
    const url =
      `${BASE}/coins/markets?vs_currency=usd&ids=${slice.join(",")}` +
      "&order=market_cap_desc";
    const { data } = await axios.get(url, { timeout: 10_000 });
    if (data.length && data[0].market_cap_rank < rank) {
      rank = data[0].market_cap_rank;
      best = data[0].id;
    }
  }

  cache.set(key, best, CAP_TTL);
  return best;
}

