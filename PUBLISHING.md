# Publishing Guide

Complete guide for publishing `svg-interactive-diagram` to npm.

## Table of Contents

- [Initial Setup](#initial-setup)
- [Manual Publishing](#manual-publishing)
- [Automated Publishing](#automated-publishing)
- [Version Numbers](#version-numbers)
- [Troubleshooting](#troubleshooting)

---

## Initial Setup

### 1. Create npm Account

If you don't have an npm account:

1. Go to https://www.npmjs.com
2. Click **Sign Up**
3. Create your account
4. Verify your email

### 2. Login to npm Locally

```bash
npm login
```

Enter your credentials when prompted.

### 3. Verify Package Name

```bash
# Check if name is available
npm view svg-interactive-diagram

# If it shows "404", the name is available!
# If it shows package info, the name is taken
```

### 4. Enable Two-Factor Authentication (Recommended)

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tfa
2. Enable 2FA for publish operations
3. Save backup codes

---

## Manual Publishing

Use this for initial releases or when you want full control.

### Step-by-Step Process

#### 1. Ensure Clean State

```bash
# Check git status
git status

# Should show: "nothing to commit, working tree clean"
# If not, commit or stash your changes
```

#### 2. Run Quality Checks

```bash
# This runs: typecheck + lint + format check + tests
npm run quality

# All must pass before publishing!
```

#### 3. Update Version

```bash
# For bug fixes (0.1.0 → 0.1.1)
npm version patch

# For new features (0.1.0 → 0.2.0)
npm version minor

# For breaking changes (0.1.0 → 1.0.0)
npm version major
```

This command:
- ✅ Updates version in `package.json`
- ✅ Creates a git commit
- ✅ Creates a git tag (e.g., `v0.2.0`)

#### 4. Update CHANGELOG.md

```bash
# Open CHANGELOG.md in editor
code CHANGELOG.md

# Move [Unreleased] items to new version section
# Example:

## [0.2.0] - 2024-11-13

### Added
- New feature X
- New feature Y

### Fixed
- Bug fix Z

## [Unreleased]
(Empty - ready for next changes)
```

#### 5. Commit Changelog

```bash
git add CHANGELOG.md
git commit -m "docs: Update changelog for v0.2.0"
```

#### 6. Build the Package

```bash
npm run build

# Verify dist/ was created
ls -la dist/
```

#### 7. Preview What Will Be Published

```bash
# Dry run - shows files that will be included
npm pack --dry-run

# You should see:
# ✓ dist/
# ✓ README.md
# ✓ LICENSE
# ✓ package.json
```

#### 8. Publish to npm

```bash
# Publish
npm publish

# If you get "You must sign up for private packages":
npm publish --access public

# Watch for success message:
# + svg-interactive-diagram@0.2.0
```

#### 9. Push to GitHub

```bash
# Push code and tags
git push origin main --follow-tags

# Verify on GitHub:
# - Commits are pushed
# - Tags are visible (under Releases)
```

#### 10. Create GitHub Release (Optional)

1. Go to https://github.com/m98/svg-interactive-diagram/releases
2. Click **"Draft a new release"**
3. Select the tag you just created (e.g., `v0.2.0`)
4. Title: `v0.2.0`
5. Description: Copy from CHANGELOG.md
6. Click **"Publish release"**

### Complete Example

```bash
# Starting from clean state
git status                    # ✓ Clean

# Quality checks
npm run quality              # ✓ All pass

# Version bump
npm version minor            # 0.1.0 → 0.2.0

# Update changelog
vim CHANGELOG.md
git add CHANGELOG.md
git commit -m "docs: Update changelog for v0.2.0"

# Build
npm run build               # ✓ dist/ created

# Publish
npm publish                 # ✓ Published to npm

# Push to GitHub
git push origin main --follow-tags  # ✓ Pushed
```

---

## Automated Publishing

Use GitHub Actions to automate the publishing process.

### One-Time Setup

#### 1. Generate npm Token

```bash
# Login to npm
npm login

# Generate token on npm website:
# 1. Go to: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
# 2. Click "Generate New Token"
# 3. Select "Automation" (not "Publish" - Automation works in CI/CD)
# 4. Copy the token (starts with npm_...)
```

#### 2. Add Token to GitHub Secrets

1. Go to your repo: https://github.com/m98/svg-interactive-diagram
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **"Add secret"**

### Using Automated Publishing

With automation set up, publishing is simpler:

```bash
# 1. Update version
npm version minor            # Creates v0.2.0 tag

# 2. Update changelog
vim CHANGELOG.md
git add CHANGELOG.md
git commit -m "docs: Update changelog for v0.2.0"

# 3. Push (with tags)
git push origin main --follow-tags

# 🎉 Done! GitHub Actions will:
# - Run all tests
# - Run linter
# - Type check
# - Build package
# - Publish to npm
# - Create GitHub release
```

### Monitoring the Build

1. Go to: https://github.com/m98/svg-interactive-diagram/actions
2. Click on the running workflow
3. Watch the steps execute
4. If any step fails, publishing is canceled (safe!)

---

## Version Numbers

Follow [Semantic Versioning](https://semver.org/):

### Format: `MAJOR.MINOR.PATCH`

- **PATCH** (0.1.0 → 0.1.1): Bug fixes, no breaking changes
  ```bash
  npm version patch
  ```

- **MINOR** (0.1.0 → 0.2.0): New features, no breaking changes
  ```bash
  npm version minor
  ```

- **MAJOR** (0.1.0 → 1.0.0): Breaking changes
  ```bash
  npm version major
  ```

### Pre-Release Versions

For testing before official release:

```bash
# Create beta version (0.2.0-beta.0)
npm version prerelease --preid=beta

# Publish as beta
npm publish --tag beta

# Users can install with:
# npm install svg-interactive-diagram@beta
```

### Version 1.0.0

Don't rush to 1.0.0! Use it when:
- ✅ API is stable
- ✅ Well-tested in production
- ✅ Ready to commit to backward compatibility
- ✅ Documentation is complete

---

## Troubleshooting

### "You do not have permission to publish"

**Solution**: Package name is taken.

```bash
# Check who owns it
npm view svg-interactive-diagram

# Options:
# 1. Use scoped package: @your-username/svg-interactive-diagram
# 2. Choose different name
# 3. Contact owner to transfer (if abandoned)
```

### "npm ERR! need auth"

**Solution**: Login again.

```bash
npm login
```

### "npm ERR! 403 Forbidden - PUT"

**Solution**: You're not logged in or don't have permission.

```bash
# Check who you're logged in as
npm whoami

# If wrong user, logout and login
npm logout
npm login
```

### "Quality checks failed"

**Solution**: Fix errors before publishing.

```bash
# Run individual checks to see what's failing
npm run typecheck
npm run lint
npm test

# Fix errors, then try again
npm run quality
```

### "Git working directory not clean"

**Solution**: Commit or stash changes.

```bash
git status
git add .
git commit -m "Your message"

# Or stash if not ready to commit
git stash
```

### Published Wrong Version

**Solution**: Deprecate and publish new version.

```bash
# Deprecate the bad version
npm deprecate svg-interactive-diagram@0.2.0 "Accidental publish, use 0.2.1"

# Publish correct version
npm version patch
npm publish
```

**Note**: You **cannot** unpublish after 24 hours!

---

## Checklist Before Publishing

Before running `npm publish`:

- [ ] All tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Type check passes (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] CHANGELOG.md updated
- [ ] README.md up to date
- [ ] Version bumped (`npm version`)
- [ ] Git working directory clean
- [ ] Reviewed `npm pack --dry-run` output

---

## After Publishing

1. **Verify on npm**:
   - Go to https://www.npmjs.com/package/svg-interactive-diagram
   - Check version number is correct
   - Verify README displays correctly

2. **Test Installation**:
   ```bash
   # In a test directory
   mkdir test-install
   cd test-install
   npm init -y
   npm install svg-interactive-diagram
   ```

3. **Announce**:
   - Tweet about the release
   - Post in relevant communities
   - Update documentation site

4. **Monitor**:
   - Watch for issues on GitHub
   - Check npm download stats
   - Respond to user feedback

---

## Resources

- **npm Documentation**: https://docs.npmjs.com/
- **Semantic Versioning**: https://semver.org/
- **GitHub Actions**: https://docs.github.com/en/actions
- **npm Token Types**: https://docs.npmjs.com/about-access-tokens

---

## Quick Reference

```bash
# Manual publish
npm run quality
npm version minor
vim CHANGELOG.md && git add CHANGELOG.md && git commit -m "docs: Update changelog"
npm publish
git push origin main --follow-tags

# Automated publish
npm version minor
vim CHANGELOG.md && git add CHANGELOG.md && git commit -m "docs: Update changelog"
git push origin main --follow-tags

# Check published package
npm view svg-interactive-diagram
```
