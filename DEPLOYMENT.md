# GitHub Pages Deployment Guide

This guide will help you deploy the Five Crowns Scorer to GitHub Pages.

## Prerequisites

- A GitHub account
- This repository pushed to GitHub

## Deployment Steps

### 1. Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Prepare for GitHub Pages deployment"
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (top navigation)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - **Branch**: `main` (or `master` if that's your default branch)
   - **Folder**: `/ (root)`
5. Click **Save**

### 3. Wait for Deployment

GitHub will automatically build and deploy your site. This usually takes 1-2 minutes.

You'll see a message like: "Your site is published at https://[username].github.io/[repository-name]/"

### 4. Verify Deployment

Visit your site at the URL provided. You should see the Five Crowns Scorer application running.

## Updating Your Site

After the initial deployment, any changes pushed to the main branch will automatically trigger a new deployment:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main
```

GitHub Pages will rebuild and redeploy within a few minutes.

## Troubleshooting

### Site Not Loading

- **Check the Actions tab** in your repository to see if the deployment succeeded
- **Verify the branch name** matches what you selected in settings
- **Check browser console** for any JavaScript errors

### 404 Error

- Make sure `index.html` is in the root directory
- Verify the repository is public (or you have GitHub Pro for private repos)
- Check that GitHub Pages is enabled in settings

### Module Loading Issues

Modern browsers require a web server to use ES6 modules. GitHub Pages provides this automatically. If testing locally:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

### CORS or Mixed Content Warnings

- Ensure all assets use relative paths (already configured)
- GitHub Pages serves content over HTTPS automatically

## Custom Domain (Optional)

To use a custom domain like `fivecrowns.yourdomain.com`:

1. Add a `CNAME` file to the root directory with your domain name
2. Configure DNS with your domain provider:
   - Add a CNAME record pointing to `[username].github.io`
3. In GitHub Pages settings, enter your custom domain
4. Enable "Enforce HTTPS" once DNS is configured

## Performance Optimization

The application is already optimized for GitHub Pages:

-  No build process required
-  All assets are local (no external dependencies)
-  Minimal file sizes
-  Responsive design for mobile devices
-  LocalStorage for data persistence

## Monitoring

To see your deployment activity:

1. Go to **Actions** tab in your repository
2. You'll see "pages build and deployment" workflows
3. Click on any workflow run to see details

## Security Notes

- The application runs entirely client-side
- No server-side code or APIs
- Game data stored locally in browser (localStorage)
- No user data leaves the device
- Safe to use over public internet

## Support

If you encounter issues:

1. Check the [GitHub Pages documentation](https://docs.github.com/pages)
2. Review repository Actions for build errors
3. Check browser DevTools console for JavaScript errors
4. Open an issue in this repository

---

**Your site should now be live at:**
`https://[your-username].github.io/[repository-name]/`
