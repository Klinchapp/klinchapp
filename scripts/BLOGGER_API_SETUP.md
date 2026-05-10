# Blogger API Syndication Setup

One-time setup so the blog publish pipeline can auto-post each Kira post to the Blogger blog (Kira's Blog) via the Blogger API.

After this is done, every published Kira post automatically syndicates to Blogger with a direct link back to klinchapp.com — no third-party shorteners, no SaaS in the loop.

## What you need to set up

Four GitHub repo secrets:
- `BLOGGER_CLIENT_ID`
- `BLOGGER_CLIENT_SECRET`
- `BLOGGER_REFRESH_TOKEN`
- `BLOGGER_BLOG_ID`

## Step 1 — Create a Google Cloud project + enable Blogger API

1. Go to https://console.cloud.google.com/
2. Top bar → **Select project** → **New Project** → name: `klinchapp-blogger-syndication` → Create.
3. Once created, make sure that project is selected in the top bar.
4. Left menu → **APIs & Services → Library**.
5. Search: `Blogger API` → click **Blogger API v3** → click **Enable**.

## Step 2 — Configure the OAuth consent screen

1. Left menu → **APIs & Services → OAuth consent screen**.
2. User Type: **External** → Create.
3. Fill in the minimum required fields:
   - App name: `Klinchapp Blogger Syndication`
   - User support email: your email
   - Developer contact: your email
   - (Skip logo, app domain, all optional fields)
4. Click **Save and Continue**.
5. **Scopes** screen → click **Add or Remove Scopes** → search `blogger` → check `https://www.googleapis.com/auth/blogger` → Update → Save and Continue.
6. **Test users** screen → click **Add Users** → add the Google account that owns Kira's Blog → Save and Continue.
7. Click **Back to Dashboard**. The app will be in "Testing" mode — that's fine; the refresh token will work indefinitely as long as the project stays in Testing.

## Step 3 — Create OAuth 2.0 credentials

1. Left menu → **APIs & Services → Credentials**.
2. **+ Create Credentials** → **OAuth client ID**.
3. Application type: **Web application**.
4. Name: `klinchapp-syndicator`.
5. **Authorized redirect URIs** → click **Add URI** → paste exactly:
   ```
   https://developers.google.com/oauthplayground
   ```
6. Click **Create**.
7. A modal pops up with **Client ID** and **Client Secret**. Copy both somewhere safe — you'll save them as GitHub secrets in step 6.

## Step 4 — Get the refresh token via OAuth Playground

1. Open https://developers.google.com/oauthplayground/ in a private/incognito window (cleaner — no cached Google accounts).
2. Top right → click the **gear icon** (⚙️ OAuth 2.0 configuration).
3. Check **Use your own OAuth credentials**.
4. Paste your **Client ID** and **Client Secret** from step 3 → close the gear panel.
5. Left side, **Step 1** → in the "Input your own scopes" box at the bottom, paste:
   ```
   https://www.googleapis.com/auth/blogger
   ```
6. Click **Authorize APIs**.
7. Sign in with the Google account that owns Kira's Blog → grant consent (you'll see "Google hasn't verified this app" — click Advanced → Go to klinchapp-blogger-syndication, that's expected since the app is in Testing).
8. After redirect, you'll be on **Step 2** → click **Exchange authorization code for tokens**.
9. The right panel shows a JSON response with `access_token` and **`refresh_token`**. Copy the `refresh_token` value (without the surrounding quotes). This is your `BLOGGER_REFRESH_TOKEN`.

## Step 5 — Get the Blog ID

1. Open https://www.blogger.com/ → sign in with the same account.
2. Click into Kira's Blog.
3. Look at the URL — it'll be something like `https://www.blogger.com/blog/posts/1234567890123456789`.
4. The numeric chunk at the end is your `BLOGGER_BLOG_ID`.

(Alternative: in OAuth Playground while you have the access token, you can call `GET https://www.googleapis.com/blogger/v3/users/self/blogs` — it returns all your blogs with IDs.)

## Step 6 — Add the four secrets to GitHub

1. Go to https://github.com/Klinchapp/klinchapp/settings/secrets/actions
2. Click **New repository secret** four times, adding each:
   - Name: `BLOGGER_CLIENT_ID` → Value: client ID from step 3
   - Name: `BLOGGER_CLIENT_SECRET` → Value: client secret from step 3
   - Name: `BLOGGER_REFRESH_TOKEN` → Value: refresh token from step 4
   - Name: `BLOGGER_BLOG_ID` → Value: blog ID from step 5

## Step 7 — Test

Manual test before relying on the Tuesday/Friday cron:

1. Go to https://github.com/Klinchapp/klinchapp/actions/workflows/blog-publish.yml
2. Click **Run workflow** → Run workflow.
3. Wait for it to complete (~5 min).
4. Check the workflow logs — the "Syndicate to Blogger" step should show `Posted to Blogger: <url>`.
5. Open Kira's Blog → confirm the post appeared with the correct title, the first 2–3 paragraphs of the article, and a direct `klinchapp.com/blog/...` link back.

## Troubleshooting

- **`OAuth token refresh failed: 400 invalid_grant`** — refresh token is invalid or revoked. Repeat step 4 to get a new one.
- **`Blogger API failed: 403 insufficient permissions`** — the OAuth scope wasn't granted. Repeat step 4 and make sure you check the consent box for Blogger access.
- **`Blogger API failed: 404`** — wrong `BLOGGER_BLOG_ID`. Verify in Blogger admin URL or via the `users/self/blogs` API call.
- **App stuck in "Testing" mode and stops working after 7 days** — Google's Testing mode used to expire refresh tokens after 7 days for sensitive scopes. The Blogger scope is non-sensitive so it should not expire, but if it does: either repeat step 4 weekly, or push the OAuth consent screen to "In production" (no verification needed for non-sensitive scopes, just a click).

## Adding WordPress.com later

This setup covers Blogger only. WordPress.com syndication uses a separate API (`https://public-api.wordpress.com/`) with its own OAuth flow. We'll add a `syndicate-to-wordpress.mjs` script using the same pattern once Blogger is confirmed working.
