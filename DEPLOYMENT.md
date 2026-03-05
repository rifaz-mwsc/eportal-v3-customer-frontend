# Deployment Guide

This project uses GitHub Actions for automated deployment to the dev server.

## Deployment Workflow

### Dev Server Deployment (`deploy-dev.yml`)

**Triggers:**
- Automatically on push to `develop` branch
- Manually via GitHub Actions UI (workflow_dispatch)

**Build Configuration:**
- Uses `dev-01` configuration
- Points to: `https://e-portal-api-dev-01.mwsc.com.mv`
- Optimized build with source maps disabled

**Deployment Method:**
- FTPS upload via `SamKirkland/FTP-Deploy-Action@v4.3.5`
- Uploads `dist/Matdash/browser/` directory

## Required GitHub Secrets

Before the deployment workflow can run, you need to configure these secrets:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of the following:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DEV_FTP_SERVER` | FTP server hostname | `ftp.mwsc.com.mv` |
| `DEV_FTP_USERNAME` | FTP username | `deploy_user` |
| `DEV_FTP_PASSWORD` | FTP password | `your-secure-password` |
| `DEV_FTP_SERVER_DIR` | Remote directory path | `/public_html/` or `/var/www/html/` |

### How to Add Secrets:

```bash
# In GitHub UI:
Settings → Secrets and variables → Actions → New repository secret

# For each secret:
1. Name: DEV_FTP_SERVER
   Secret: your-ftp-server.com

2. Name: DEV_FTP_USERNAME
   Secret: your-username

3. Name: DEV_FTP_PASSWORD
   Secret: your-password

4. Name: DEV_FTP_SERVER_DIR
   Secret: /path/to/deploy/
```

## Build Configurations

### Development (Local)
```bash
npm start
# or
ng serve --configuration=development
```
- API: Points to dev-01 server
- Optimization: Disabled
- Source Maps: Enabled

### Dev-01 (Deployment)
```bash
npm run build -- --configuration=dev-01
# or
ng build --configuration=dev-01
```
- API: `https://e-portal-api-dev-01.mwsc.com.mv`
- Optimization: Enabled
- Source Maps: Disabled
- Output Hashing: Enabled

### Production
```bash
npm run build
# or
ng build --configuration=production
```
- API: Production server
- Optimization: Enabled
- Source Maps: Disabled
- Output Hashing: Enabled

## Deployment Process

### Automatic Deployment

1. **Create/switch to develop branch:**
   ```bash
   git checkout -b develop
   # or
   git checkout develop
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

3. **Push to develop branch:**
   ```bash
   git push origin develop
   ```

4. **GitHub Actions will automatically:**
   - Checkout code
   - Install dependencies
   - Build with dev-01 configuration
   - Deploy to FTP server
   - Report deployment status

### Manual Deployment

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Dev Server** workflow
3. Click **Run workflow**
4. Select `develop` branch
5. Click **Run workflow** button

## Monitoring Deployment

### View Deployment Status

1. Go to **Actions** tab in your GitHub repository
2. Click on the latest workflow run
3. View real-time logs and deployment progress

### Deployment Logs

The workflow provides detailed logs including:
- ✅ Build completion
- 📁 Files uploaded
- 🌐 Target server
- 📂 Deployment directory

### Troubleshooting

**Build Fails:**
- Check `npm run build -- --configuration=dev-01` works locally
- Review error logs in Actions tab

**Deployment Fails:**
- Verify FTP credentials are correct
- Check FTP server is accessible
- Ensure server directory exists and has write permissions
- Review FTP logs in workflow output

**Version Not Updating:**
- Version increments automatically on each build
- Check `version.json` in deployed files

## Branch Strategy

- `main` - Production-ready code (manual deployment)
- `develop` - Development code (auto-deploys to dev-01 server)
- `feature/*` - Feature branches (no auto-deployment)

## Environment Files

- `environment.ts` - Production config
- `environment.development.ts` - Local development config  
- `environment.dev-01.ts` - Dev server config (auto-deployed)

## Notes

- The CI workflow (`ci.yml`) runs on all branches to check build integrity
- The deploy workflow (`deploy-dev.yml`) only runs on `develop` branch
- Version number increments with each build
- Deployments are logged and trackable via GitHub Actions
