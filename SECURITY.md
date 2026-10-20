# Security

This is a local-first application. By default it binds to `127.0.0.1` and has no authentication.

If you deploy it on a shared machine or expose it through a reverse proxy:

- Add authentication at the proxy layer.
- Restrict access to the `data/` directory.
- Keep Node.js and dependencies up to date.
- Do not put secrets into `data/` backups that are shared publicly.

## Reporting

Please report security issues privately through GitHub Security Advisories rather than a public issue. Include the version, reproduction steps, and affected endpoint.
