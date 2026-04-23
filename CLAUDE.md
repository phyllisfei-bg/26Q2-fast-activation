# 26Q2-fast-activation

BitGo fast-activation prototype — self-contained HTML/CSS/JS files, no build step.

## File map

| File | What it is |
|---|---|
| `flow.html` | Entry point — user flow diagram linking all three experiences |
| `bitgo-KYB.html` | KYB flow (legal person / business verification) |
| `bitgo-kyc.html` | KYC flow (invited platform admins & default-role users) |
| `bitgo-dashboard.html` | Getting Started dashboard (role-based + For You section) |
| `card-hover-exploration.html` | Card hover interaction sandbox |
| `index.html` | Misc / landing |

## How to work on this with Claude Code

Open this folder in Claude Code (`claude` in your terminal from this directory).
All files are single-file HTML — edit in place, preview in browser.

### Common tasks

- **Change a component**: tell Claude which file + which screen/step
- **Add a new screen**: Claude will add a new `<section id="pageN">` and wire up navigation
- **Push updates**: after Claude edits files, run `git add -A && git commit -m "..." && git push`

### GitHub repo

Private repo at: `https://github.com/phyllisfei-bg/26Q2-fast-activation`

After making changes, push with: `git add -A && git commit -m "..." && git push`

## Design tokens (dark-mode aware)

All three flows share CSS custom properties:
- `--color-primary` `--color-level1/2` `--color-text` `--color-border`
- Theme toggle is in the top-right corner of each flow screen

## Do not

- Add a bundler or build tool — keep files self-contained
- Rename the HTML files (links between pages depend on exact filenames)
