# Deployment configuration

Set `VITE_GOOGLE_MAPS_API_KEY` in the Netlify project's environment variables
with the Builds scope for each deploy context that needs maps. For local
development, use an ignored `.env.local` file based on `.env.example`. Do not
commit credentials. Maps have no hardcoded fallback key.

Vite embeds this browser key in the client bundle. Before deploying, configure
the key in Google Cloud with **Websites** application restrictions for the
production site's exact hostname and any custom domains, and with API
restrictions allowing only **Maps JavaScript API**. Authorize preview hosts
explicitly if previews need maps; do not allow all Netlify sites. Prefer a
separate, restricted development key for localhost.

The previously hardcoded key must be reviewed for unauthorized use and replaced
if compromised or its ownership is unknown. Removing it from source does not
remove it from repository history or previously published bundles. Update
Netlify with a key you control, verify maps work with its restrictions, then
revoke the old key if it is yours and no longer needed.

`netlify.toml` omits only `VITE_GOOGLE_MAPS_API_KEY` from environment-variable
secret scanning because its browser exposure is intentional. Scanning remains
enabled for other secrets, and no source or output directories are excluded.
This exception does not restrict the key or make it private; Google Cloud
restrictions must be configured separately. Never add server-only credentials,
such as `GEMINI_API_KEY`, to the omission list or expose them with a `VITE_`
prefix.
