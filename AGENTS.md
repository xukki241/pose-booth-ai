# Pose-Booth engineering workflow

- Canonical frontend: `apps/web`. Root Vite is legacy; do not duplicate new features there.
- Read callers, schemas, config and tests before edits. Keep old `/api/pose/*` contracts stable. New product APIs use `/api/v1`.
- White-only Comic UI on installed c-comic-ui, Nunito/Geist Mono and semantic tokens is the design authority in DESIGN.md. This supersedes earlier shadcn/system/light/dark Prismo decisions by user request. Camera screens are task interfaces, not marketing scrollytelling pages.
- No scroll-driven React state, full-screen backdrop blur or decorative perpetual rendering. Use native scrolling; GSAP is reserved for bounded feedback with cleanup/reduced-motion.
- Photo originals stay unchanged in browser memory. Filter definitions are shared between preview/export; filter image pixels, never frame artwork. Import stays local until explicit gallery consent.
- Use one owner per camera stream, worker and GPU model. Late async responses must not revive disposed streams or replace a newer result.
- Never fabricate scores, FPS, dataset metrics, consent, readiness or release claims. Missing data is an explicit state.
- No customer image or secret uploads. Gallery expiry is separate from training eligibility. No paid cloud resources without an approved budget.
- Data raw inputs are immutable. Review incoming scripts and archive paths before executing/extracting. A scan error is not a clean audit.
- Python research logic lives in `ai/research`; notebooks call it. Training is opt-in, not an import side effect. Candidate is not automatically production-approved.
- Before handoff: frontend build, relevant geometry tests, API tests, data tests, `git diff --check`, browser QA, and scoped Docker smoke when services change.
- Windows native Python: `apps/api/.venv/Scripts/python.exe`. Docker uses `.env.pilot`; never print resolved compose config or secrets.
- Update docs/IMPLEMENTATION_STATUS.md with evidence and outstanding gates. Green unit tests are not proof of three-device camera or long soak acceptance.
- Do not install global hooks or batches of third-party skills. Audit immutable source bundles and preserve provenance before allowlisting.
