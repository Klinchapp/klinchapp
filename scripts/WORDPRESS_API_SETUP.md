# WordPress.com API Syndication Setup

One-time setup so the blog publish pipeline can auto-post each Kira post to `kirasaiblog.wordpress.com` via the WordPress.com REST API.

After this is done, every published Kira post automatically syndicates to WordPress.com with a direct link back to klinchapp.com — same shape as Blogger syndication, second free backlink source.

## What you need to set up

Two GitHub repo secrets:
- `WORDPRESS_ACCESS_TOKEN`
- `WORDPRESS_SITE_ID`

WordPress.com's API uses long-lived access tokens (no refresh dance, unlike Google). You mint a token once, it works indefinitely until revoked.

## Step 1 — Register an app at developer.wordpress.com

1. Go to https://developer.wordpress.com/apps/
2. Sign in with the WordPress.com account that owns `kirasaiblog.wordpress.com`.
3. Click **Create New Application**.
4. Fill in:
   - **Name**: `klinchapp-syndicator`
   - **Description**: `Auto-syndicates Klinchapp blog posts to Kira's WP.com blog`
   - **Website URL**: `https://www.klinchapp.com`
   - **Redirect URLs**: `https://developer.wordpress.com/apps/` (we won't actually use the redirect — the password grant flow doesn't need one — but the field is required)
   - **Type**: **Web**
5. Click **Create**.
6. The app detail page shows your **Client ID** and **Client Secret**. Copy both somewhere safe — you'll use them in step 3.

## Step 2 — Generate an Application Password

1. Go to https://wordpress.com/me/security/two-step (or via your account settings → Security → Two-Step Authentication).
2. Scroll to **Application Passwords**.
3. Click **Add new application password**.
4. Name: `klinchapp-syndicator`.
5. Click **Generate password**.
6. **Copy the password immediately** — WP.com only shows it once. You'll use it in step 3 and then can discard it.

(If you don't have two-step authentication enabled, enable it first — Application Passwords require it.)

## Step 3 — Mint a long-lived access token

Run this from your local terminal (replace the placeholders):

```bash
curl -X POST https://public-api.wordpress.com/oauth2/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=YOUR_WORDPRESS_COM_USERNAME" \
  -d "password=YOUR_APPLICATION_PASSWORD_FROM_STEP_2"
```

The response looks like:

```json
{
  "access_token": "abc123...verylong...xyz",
  "token_type": "bearer",
  "blog_id": "12345678",
  "blog_url": "https://kirasaiblog.wordpress.com",
  "scope": "global"
}
```

Save the `access_token` value — this is your `WORDPRESS_ACCESS_TOKEN`. **It does not expire** until you explicitly revoke it from your WP.com account.

You can also note the `blog_id` here — but it's easier to use the domain (next step).

After this step, the client_secret and the Application Password are no longer needed by the pipeline. You can revoke the Application Password if you want (Security settings → Application Passwords) since the access token doesn't depend on it post-issuance.

## Step 4 — Get the Site ID

You have two options — either works as `WORDPRESS_SITE_ID`:

**Option A — Use the domain (simpler):**
```
kirasaiblog.wordpress.com
```

**Option B — Use the numeric blog ID:**
The numeric ID was in the step 3 response (`blog_id` field). Or you can query it:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://public-api.wordpress.com/rest/v1.1/me/sites
```

Either works. The domain is more readable.

## Step 5 — Add the two secrets to GitHub

1. Go to https://github.com/Klinchapp/klinchapp/settings/secrets/actions
2. Click **New repository secret** twice:
   - Name: `WORDPRESS_ACCESS_TOKEN` → Value: access token from step 3
   - Name: `WORDPRESS_SITE_ID` → Value: `kirasaiblog.wordpress.com` (or the numeric blog ID)

## Step 6 — Test

1. Go to https://github.com/Klinchapp/klinchapp/actions/workflows/blog-publish.yml
2. Click **Run workflow** → branch `feat-wordpress-syndication` (or `main` after merge) → Run workflow.
3. Watch the logs — the **Syndicate to WordPress** step should show `Posted to WordPress: <url>`.
4. Open `https://kirasaiblog.wordpress.com/` → confirm the new post appeared with: correct title, ~3-paragraph teaser, direct `klinchapp.com/blog/...` link back, "by Kira" footer.

## Troubleshooting

- **`WordPress API failed: 401 invalid_token`** — access token is wrong or has been revoked. Repeat step 3.
- **`WordPress API failed: 403 unauthorized_blog`** — the access token's scope doesn't include posting to the target site. Re-mint with a "global" scope token (which is what step 3's request returns by default for personal accounts).
- **`WordPress API failed: 404 unknown_blog`** — wrong `WORDPRESS_SITE_ID`. Verify the domain spelling or use the numeric blog ID from step 4 option B.
- **Application Password generation fails** — you need 2FA enabled on your WP.com account. Enable two-step authentication first.
