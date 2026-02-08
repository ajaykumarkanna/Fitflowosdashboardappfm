
# Integrations Setup

## 1. Push Notifications (Firebase Cloud Messaging)

Since this app uses Supabase for the backend, we use Supabase Edge Functions to trigger notifications.

1.  **Firebase Console**: Create a project and get your "Server Key" (Cloud Messaging tab).
2.  **Supabase Secrets**:
    -   Go to Supabase Dashboard > Settings > Edge Functions > Secrets.
    -   Add `FCM_SERVER_KEY`.
3.  **Frontend**:
    -   You need to add the firebase-js-sdk to `src/lib/firebase.ts` (not included by default) to request permission and get the device token.
    -   Save the device token to the `profiles` table in a new column `fcm_token`.
4.  **Backend (Edge Function)**:
    -   Create a function `send-notification`.
    -   Use `fetch('https://fcm.googleapis.com/fcm/send', ...)` with the server key to send messages to tokens stored in the DB.

## 2. WhatsApp Notifications (Twilio)

1.  **Twilio Console**: Sign up and get a WhatsApp Sandbox number (or enable a real number).
2.  **Get Credentials**: Account SID and Auth Token.
3.  **Supabase Secrets**:
    -   Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.
4.  **Backend (Edge Function)**:
    -   Create a function `send-whatsapp`.
    -   Use the Twilio Node.js helper library or simple HTTP requests to the Twilio API.
5.  **Scheduling**:
    -   Use pg_cron (available in Supabase Database > Extensions) to call your Edge Function every morning.
    -   Example SQL: `select cron.schedule('0 7 * * *', 'select net.http_post(...)');`

## 3. Deployment

1.  **Build**: Run `npm run build`.
2.  **GitHub Pages**:
    -   Push code to GitHub.
    -   Go to Settings > Pages.
    -   Select `gh-pages` branch (or configure Actions to deploy `dist` folder).
    -   Since this is a client-side router app, you might need a `404.html` that redirects to `index.html` for deep links to work on refresh.
