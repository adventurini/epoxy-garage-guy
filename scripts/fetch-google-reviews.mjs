#!/usr/bin/env node
/**
 * Refresh data/google-reviews.json from Google Places API.
 * Usage: GOOGLE_PLACES_API_KEY=... node scripts/fetch-google-reviews.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PLACE_ID = 'ChIJW-STVKx924AR8cCHPlHxsBU';
const key = process.env.GOOGLE_PLACES_API_KEY;

if (!key) {
  console.error('Set GOOGLE_PLACES_API_KEY');
  process.exit(1);
}

const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
url.searchParams.set('place_id', PLACE_ID);
url.searchParams.set('fields', 'name,rating,user_ratings_total,reviews,url');
url.searchParams.set('key', key);

const res = await fetch(url);
const data = await res.json();

if (data.status !== 'OK') {
  console.error(data);
  process.exit(1);
}

const { result } = data;
const out = {
  placeId: PLACE_ID,
  name: result.name,
  rating: result.rating,
  userRatingsTotal: result.user_ratings_total,
  url: result.url,
  fetchedAt: new Date().toISOString().slice(0, 10),
  reviews: (result.reviews || []).map((r) => ({
    author: r.author_name,
    rating: r.rating,
    relativeTime: r.relative_time_description,
    text: r.text,
  })),
};

const root = dirname(dirname(fileURLToPath(import.meta.url)));
writeFileSync(join(root, 'data/google-reviews.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Saved ${out.reviews.length} reviews (${out.rating} avg, ${out.userRatingsTotal} total)`);
