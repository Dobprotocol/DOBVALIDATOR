# 🚀 DOB Validator Deployment Workflow

## 📋 Current Setup

- **Production Branch**: `main` (deployed to Vercel)
- **Development Branch**: `fix/vercel` (your working branch)
- **Deployment Source**: `main` branch only

## 🔄 Workflow for New Features/Fixes

### 1. **Development Phase** (on `fix/vercel`)

```bash
# You're already on fix/vercel branch
# Make your changes
git add .
git commit -m "feat: your feature description"
git push origin fix/vercel
```

### 2. **Testing Phase**

- Test your changes thoroughly on `fix/vercel`
- Create a test deployment if needed (temporary)
- Ensure everything works as expected

### 3. **Ready for Production**

```bash
# Switch to main branch
git checkout main

# Merge your changes from fix/vercel
git merge fix/vercel

# Push to trigger Vercel deployment
git push origin main
```

### 4. **Continue Development**

```bash
# Switch back to fix/vercel for next feature
git checkout fix/vercel

# Continue with new development
```

## 🎯 **Alternative: Squash Merge (Recommended)**

For cleaner history, use squash merge:

```bash
# Switch to main
git checkout main

# Squash merge (combines all commits into one)
git merge --squash fix/vercel

# Create a meaningful commit message
git commit -m "feat: comprehensive feature description"

# Push to trigger deployment
git push origin main
```

## ⚙️ **Vercel Configuration**

### Update Vercel Dashboard Settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Git**
3. Configure:
   - **Production Branch**: `main`
   - **Preview Branches**: Leave empty or add `fix/vercel` for testing
   - **Auto-deploy**: Only for `main` branch

### Vercel.json Configuration:

The `vercel.json` files are already configured to:

- Only deploy on `main`, `develop`, `staging` branches
- Disable preview deployments
- Use explicit build commands

## 🚨 **Emergency Rollback**

If you need to rollback production:

```bash
# Find the previous working commit
git log --oneline main -10

# Reset main to previous commit
git checkout main
git reset --hard <previous-commit-hash>
git push origin main --force
```

## 📊 **Branch Status Commands**

```bash
# Check current branch
git branch

# See commit differences between branches
git log main..fix/vercel --oneline

# See what's in main that's not in fix/vercel
git log fix/vercel..main --oneline

# Check deployment status
git status
```

## 🎉 **Benefits of This Setup**

✅ **Clean Production History**: Only meaningful commits in `main`
✅ **Safe Development**: Work freely on `fix/vercel`
✅ **Controlled Deployments**: Only deploy when ready
✅ **Easy Rollbacks**: Simple to revert if needed
✅ **No Deployment Noise**: No more hundreds of deployment commits

## 🔧 **Quick Commands Reference**

```bash
# Start new feature
git checkout fix/vercel
# ... make changes ...
git add . && git commit -m "feat: new feature"
git push origin fix/vercel

# Deploy to production
git checkout main
git merge --squash fix/vercel
git commit -m "feat: comprehensive feature description"
git push origin main

# Continue development
git checkout fix/vercel
```

## 📞 **Troubleshooting**

### If Vercel deployment fails:

1. Check Vercel build logs
2. Ensure all dependencies are in `package.json`
3. Verify build commands in `vercel.json`
4. Test locally with `pnpm build`

### If merge conflicts occur:

1. Resolve conflicts in `fix/vercel`
2. Test thoroughly
3. Then merge to `main`

### If you need to sync branches:

```bash
# Sync fix/vercel with main
git checkout fix/vercel
git merge main

# Or reset fix/vercel to match main
git checkout fix/vercel
git reset --hard main
```
