# MoneyMe Loan App — Session Recovery & Operating Contract

## SESSION RESTART RECOVERY (READ THIS FIRST)

1. Run: `cat PROGRESS.md` — see what's done and what's next
2. Run: `gh issue list --repo loan-app-demo --state open`
3. Run: `gh project item-list 6 --owner "@me"`
4. Find the first open issue not marked Done — that's your current task
5. Check if a branch exists: `git branch -a | grep feat/`
6. If mid-work branch exists, check it out and continue
7. Follow the Agent Loop below for the current issue

## GITHUB PROJECT IDS (needed for kanban commands)

```
PROJECT_NUM=6
PROJECT_ID=PVT_kwHOAyFZxM4BRYzT
STATUS_FIELD_ID=PVTSSF_lAHOAyFZxM4BRYzTzg_OvuM
BACKLOG_ID=f75ad846
IN_PROGRESS_ID=47fc9ee4
IN_REVIEW_ID=df73e18b
DONE_ID=98236657
```

### Item IDs (issue# → board item ID)
```
1 → PVTI_lAHOAyFZxM4BRYzTzgnJcEY
2 → PVTI_lAHOAyFZxM4BRYzTzgnJcGQ
3 → PVTI_lAHOAyFZxM4BRYzTzgnJcl8
4 → PVTI_lAHOAyFZxM4BRYzTzgnJctE
5 → PVTI_lAHOAyFZxM4BRYzTzgnJcuw
6 → PVTI_lAHOAyFZxM4BRYzTzgnJcwY
7 → PVTI_lAHOAyFZxM4BRYzTzgnJczg
8 → PVTI_lAHOAyFZxM4BRYzTzgnJc1M
9 → PVTI_lAHOAyFZxM4BRYzTzgnJc4g
```

## KANBAN MOVEMENT COMMANDS

Move to In Progress:
```bash
gh project item-edit --project-id PVT_kwHOAyFZxM4BRYzT --id <ITEM_ID> --field-id PVTSSF_lAHOAyFZxM4BRYzTzg_OvuM --single-select-option-id 47fc9ee4
```

Move to In Review:
```bash
gh project item-edit --project-id PVT_kwHOAyFZxM4BRYzT --id <ITEM_ID> --field-id PVTSSF_lAHOAyFZxM4BRYzTzg_OvuM --single-select-option-id df73e18b
```

Move to Done:
```bash
gh project item-edit --project-id PVT_kwHOAyFZxM4BRYzT --id <ITEM_ID> --field-id PVTSSF_lAHOAyFZxM4BRYzTzg_OvuM --single-select-option-id 98236657
```

## AGENT LOOP (for each issue, in order US-01 through US-09)

### Step 1: DECOMPOSE
- Read the issue: `gh issue view <number>`
- Break into subtasks. Identify files to create/modify.

### Step 2: MOVE TO IN PROGRESS
```bash
gh project item-edit --project-id PVT_kwHOAyFZxM4BRYzT --id <ITEM_ID> --field-id PVTSSF_lAHOAyFZxM4BRYzTzg_OvuM --single-select-option-id 47fc9ee4
```

### Step 3: BRANCH
```bash
git checkout main && git pull
git checkout -b feat/us-XX-description
```

### Step 4: GENERATE
- Write code following conventions below
- Sanitise ALL inputs, maxlength on ALL fields
- No PII in localStorage — sessionStorage only
- Test manually: `npx serve . -p 3000`

### Step 5: VALIDATE
- Run: `node security/audit.js` (must exit 0)
- Run: `npx playwright test` (if tests exist for this feature)
- Both must pass before proceeding

### Step 6: CORRECT (if failures)
- Fix the issue. Re-run validation.
- Max 3 attempts. If still failing after 3, add comment to issue and escalate to user.

### Step 7: COMMIT
- Conventional commits: `feat(us-XX): description`
- Push: `git push -u origin feat/us-XX-description`

### Step 8: PR
- NEVER open a PR with failing tests
- Run security audit + playwright BEFORE opening PR
- Template:
  ```
  ## Summary
  Closes #XX
  - [what was built]

  ## Test Results
  - Security audit: PASS/FAIL
  - Playwright tests: X/Y passing

  ## Security Checklist
  - [ ] All inputs sanitised
  - [ ] maxlength on all fields
  - [ ] No PII in localStorage
  - [ ] No inline event handlers
  - [ ] CSP meta tag present
  ```

### Step 9: MOVE TO IN REVIEW
```bash
gh project item-edit --project-id PVT_kwHOAyFZxM4BRYzT --id <ITEM_ID> --field-id PVTSSF_lAHOAyFZxM4BRYzTzg_OvuM --single-select-option-id df73e18b
```

### Step 10: MERGE & MOVE TO DONE
```bash
gh pr merge <number> --squash --delete-branch
gh project item-edit --project-id PVT_kwHOAyFZxM4BRYzT --id <ITEM_ID> --field-id PVTSSF_lAHOAyFZxM4BRYzTzg_OvuM --single-select-option-id 98236657
```

### Step 11: UPDATE PROGRESS.md
Log: issue number, title, status, date, test results.

## KANBAN RULES
- Starting work → In Progress
- PR opened → In Review
- PR merged → Done
- Board must reflect real status AT ALL TIMES
- NEVER rely on memory. GitHub is source of truth.

## PR RULES
- Never open PR with failing tests
- Run `node security/audit.js` before every PR
- Run `npx playwright test` before every PR (if tests exist)
- Use conventional commits: `feat(us-XX): description`

## WSL RULES
- Working dir: ~/loan-app-demo ALWAYS
- Preview: `npx serve . -p 3000`
- Playwright: CommonJS config (module.exports), headless: true
- Never use /mnt/c paths

## CONVENTIONS
- Vanilla HTML/CSS/JS only (no frameworks)
- Mobile-first responsive design
- BEM-like CSS naming
- ES6+ JavaScript, no var
- All functions documented with JSDoc
- Semantic HTML5 elements

## SECURITY
- Sanitise all user inputs (strip HTML tags, trim whitespace)
- maxlength attribute on every input/textarea
- sessionStorage only — never localStorage for PII
- CSP meta tag in all HTML files
- rel="noopener noreferrer" on all external links
- No eval(), no innerHTML with user data
- No inline event handlers

## TEST COMMANDS
```bash
node security/audit.js        # Security audit (must pass before PR)
npx playwright test            # E2E tests
npx serve . -p 3000           # Local preview
```

## USER STORIES (9 total)
| # | Title | Branch |
|---|-------|--------|
| 1 | US-01: Landing page with hero section, navbar, and footer | feat/us-01-landing-page |
| 2 | US-02: Interactive loan calculator with real-time updates | feat/us-02-loan-calculator |
| 3 | US-03: Application form step 1 — personal details | feat/us-03-personal-details |
| 4 | US-04: Application form step 2 — employment and income | feat/us-04-employment-income |
| 5 | US-05: Application form step 3 — loan configuration | feat/us-05-loan-details |
| 6 | US-06: Application review summary and submission | feat/us-06-summary-submit |
| 7 | US-07: Responsive design and accessibility compliance | feat/us-07-responsive-a11y |
| 8 | US-08: End-to-end Playwright test suite | feat/us-08-e2e-tests |
| 9 | US-09: Security audit and input hardening | feat/us-09-security-audit |
