/*
  Test script to reproduce `createEvent` insertion and RLS behavior.

  Usage:
    SUPABASE_URL=https://xyz.supabase.co \
    SUPABASE_KEY=<anon_or_service_key> \
    TEST_TOKEN=<admin_access_token> \
    node ./scripts/test-create-event.js

  The script will POST a minimal event to the PostgREST endpoint and print the response.
*/

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TEST_TOKEN = process.env.TEST_TOKEN;

if (!SUPABASE_URL || !SUPABASE_KEY || !TEST_TOKEN) {
  console.error('Please set SUPABASE_URL, SUPABASE_KEY and TEST_TOKEN in the environment.');
  process.exit(1);
}

const payload = {
  title: 'Test Event from script',
  description: 'Automated test',
  date: new Date().toDateString(),
  location: 'Test location',
  tag: 'Social',
  tag_color: '#c0392b',
  is_featured: false
};

async function run() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_TOKEN}`,
        apikey: SUPABASE_KEY,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log('Status:', res.status);
    try { console.log('Body:', JSON.parse(text)); } catch { console.log('Body:', text); }
  } catch (err) {
    console.error('Request failed:', err);
  }
}

run();
