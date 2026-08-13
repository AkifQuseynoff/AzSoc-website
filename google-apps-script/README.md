# Google Sheets registrations setup

1. Create one Google Sheet where all event registrations should be stored.
2. Choose **Extensions → Apps Script**, replace the editor contents with `event-registration-receiver.js`, and save.
3. In **Project Settings → Script properties**, create `WEBHOOK_SECRET` with a long random value.
4. Choose **Deploy → New deployment → Web app**. Set **Execute as** to yourself and grant access to the people who will submit registrations. Copy the deployed URL ending in `/exec` (not the `/dev` test URL).
5. In Supabase **Edge Functions → Secrets**, add these two values:
   - `GOOGLE_SHEETS_WEBHOOK_SECRET`: the exact same secret value.
   - `GOOGLE_SHEETS_WEBHOOK_URL`: the copied Apps Script `/exec` URL.
6. Deploy `supabase/functions/register-for-eventoka` to Supabase.

The Google Sheet URL itself is not used by the website. Every event registration is now sent automatically to this one central sheet; admins do not add a URL when creating events.
