# Cellscape backend and admin guide

Start with the [main README](../README.md) for the Git clone command, required software, biology sources, images, and website controls.

All commands below run from the **project root** (`CellBiologyWebsite`), not from inside `backend/`.

## Quick start

Requires Python 3.10 or newer. No npm or pip installation is needed.

```sh
python3 backend/server.py --setup-admin
python3 backend/server.py
```

The first command asks you to enter and confirm your own admin passphrase, at least 14 characters long. Input is hidden. The second command starts the website and API; leave that terminal running.

- Website: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- Admin: [http://127.0.0.1:8000/admin.html](http://127.0.0.1:8000/admin.html)

There is no default admin passphrase and no username. Students can use quizzes without signing in. If you do not need the dashboard yet, skip `--setup-admin`; quiz saving still works.

Stop the server with **Ctrl+C**. Restart it with `python3 backend/server.py`. Database records survive restarts; admin login sessions do not. On Windows, use `py -3` in place of `python3` if necessary.

A static preview server, VS Code Live Server, or GitHub Pages does not run this backend. On those hosts, the quiz reports that saving is unavailable.

## What gets saved

Starting a quiz creates a random anonymous session. Wrong choices, correct choices, hints, and reveals are separate events. The server validates question order, computes correctness from `quiz-bank.json`, and deduplicates repeated event IDs.

The database stores session IDs, specimens, question IDs, answer choices, correctness, and timestamps. It does not store student names, emails, IP addresses, or user-agent strings. Session credentials stay in page memory; only their hashes are stored on the server. Reloading the page starts fresh browser state; existing database records remain.

| File | Purpose |
| --- | --- |
| `backend/data/quiz.sqlite3` | Quiz sessions and response events |
| `backend/data/admin.json` | Admin passphrase salt, work factor, and hash |

These files are ignored by Git and blocked by the backend's static-file allowlist. Keep them out of `assets/` and any public web directory. Hosting providers may keep separate request logs.

## Reading scores

Sign in to `/admin.html`, optionally filter by specimen, then select **View answers** for a session.

- **First try:** a correct answer on the first attempt, without a prior hint.
- **Assisted:** correct after a wrong answer or hint.
- **Revealed:** the answer was shown instead of solved.
- **Complete:** all five questions were solved or revealed.
- **In progress / not started:** an unfinished session; its score is provisional.

The score is first-try correct answers **out of five**, not the total eventually solved. The dashboard shows each question's expected answer and the ordered history of choices, hints, and reveals. All records are anonymous; they cannot identify a particular student. This is self-directed practice tracking, not a verified exam system.

## Private CSV export

In a second terminal, from the project root:

```sh
python3 backend/server.py --export quiz-export.csv
```

This exports the current database locally and exits; it does not start another server. The file has one row per event, with session, specimen, question number, expected answer, prompt, event type, chosen answer, correctness, and timestamp. Timestamps are Unix seconds; the dashboard displays dates in the browser's local timezone.

Keep the CSV private. The default `quiz-export*.csv` filenames are ignored by Git. Exports are not automatically removed when database records expire.

## Retention and cleanup

Default retention is **30 days from session creation**. Expired sessions and their events are removed at server startup, on quiz submissions, and when admin results are requested.

To remove already-expired records without starting another server:

```sh
python3 backend/server.py --purge
```

This does not delete all records. For hosted deployments, schedule this command so cleanup also runs during periods without visitors. Delete old exported copies separately according to your own retention policy.

## Changing settings

| Option | Example | Purpose |
| --- | --- | --- |
| `--port` | `python3 backend/server.py --port 8002` | Use another port if 8000 is occupied |
| `--database` | `python3 backend/server.py --database /private/path/quiz.sqlite3` | Use a different SQLite file |
| `--retention-days` | `python3 backend/server.py --retention-days 14` | Change the database retention period |
| `--secure-cookies` | See hosting notes below | Require HTTPS delivery of the admin cookie |

Use the same `--database` path for serving, admin setup, CSV export, and cleanup. Admin credentials are stored in `admin.json` beside the selected database. Keep that directory private.

If you change retention, update the visitor privacy notice in `about.html` and the saving-status text in `quiz-store.js` to match. If you change quiz structure IDs or functions, update `backend/quiz-bank.json` as well.

## Admin passphrase and login security

To change or reset your passphrase:

1. Stop the running server with Ctrl+C.
2. Run `python3 backend/server.py --setup-admin` and enter the new passphrase twice.
3. Restart with `python3 backend/server.py` and sign in again.

Restarting revokes existing admin sessions. There is no remote setup/reset endpoint.

Passphrases use salted PBKDF2-HMAC-SHA256 with 600,000 iterations; the credential file has owner-only permissions. The source code contains no default password. Keep `admin.json` private even though it contains a hash rather than plaintext.

Admin sessions use random tokens in HttpOnly, SameSite=Strict cookies scoped to `/api/admin`. Only token hashes are held in server memory. Sessions expire after one hour and are revoked on logout or server restart. Admin APIs reject unauthenticated requests. Login attempts have per-address and global 15-minute throttles held in memory; passwords and cookie values are not written to application logs.

Dashboard responses and documents use `Cache-Control: no-store`. The dashboard renders result data as text. This is a single-operator passphrase system, not a multi-user account service or MFA provider.

## Online hosting is separate

The default server binds to `127.0.0.1` for local development. **GitHub Pages cannot run Python, SQLite, or admin login.** No online backend is deployed by these instructions.

Before online use, arrange HTTPS through a trusted reverse proxy, a private persistent disk, provider rate limits, backups/access controls, and scheduled retention cleanup. Use `--secure-cookies` for HTTPS admin sessions. Non-loopback binding is refused without that flag, but the flag alone does not configure HTTPS. Do not expose this standard-library development server directly to the internet.

## Tests

```sh
python3 -m unittest discover -s backend -p 'test_*.py'
```

Tests use temporary databases and local HTTP servers. They cover saved attempts, retries, hints, reveals, question validation, retention, private-file blocking, login, logout, throttling, protected results, and score calculations.

## Mixed practice and insights

The `practice` model stores canonical question IDs from `lab-data.js`; the matching definitions and allowed answer IDs live in `quiz-bank.json`. Update both when editing questions. Correctness is checked on the server. Atlas and mixed-practice saving queues are separate, so switching views does not attach answers to another quiz.

Admin insights aggregate all sessions matching the selected filter, including sessions outside the displayed page. First try means the first event for that question was a correct answer; hints or retries make later correctness assisted. Revealed answers are separate. A session is incomplete until all five questions are answered correctly or revealed. Concept support counts attempted questions that were not correct independently on the first try. These are practice events, not distinct students or validated assessment grades. Experiment predictions and journey checks are not submitted.
