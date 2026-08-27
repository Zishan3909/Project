const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const deployDir = path.join(rootDir, 'deploy');

console.log('--- Starting Unified Build ---');

// 1. Run builds
console.log('Nuking old dist folders to clear Vite cache...');
if (fs.existsSync(path.join(rootDir, 'dashboard', 'dist'))) fs.rmSync(path.join(rootDir, 'dashboard', 'dist'), { recursive: true, force: true });
if (fs.existsSync(path.join(rootDir, 'mobile', 'dist'))) fs.rmSync(path.join(rootDir, 'mobile', 'dist'), { recursive: true, force: true });

console.log('Building Dashboard...');
execSync('npm run build', { cwd: path.join(rootDir, 'dashboard'), stdio: 'inherit' });

console.log('Building Mobile...');
execSync('npm run build', { cwd: path.join(rootDir, 'mobile'), stdio: 'inherit' });

// 2. Prep deploy directory
console.log('Preparing deploy directory...');
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir);

// 3. Copy dists
console.log('Copying distribution files...');
fs.cpSync(path.join(rootDir, 'dashboard', 'dist'), path.join(deployDir, 'dashboard'), { recursive: true });
fs.cpSync(path.join(rootDir, 'mobile', 'dist'), path.join(deployDir, 'mobile'), { recursive: true });

// 4. Create _redirects
console.log('Creating _redirects...');
const redirects = `/dashboard/*  /dashboard/index.html  200\n/mobile/*     /mobile/index.html     200`;
fs.writeFileSync(path.join(deployDir, '_redirects'), redirects);

// 5. Create Root index.html with Auto-Router
console.log('Creating index.html with device auto-routing...');
const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TourGuard AI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: #050505;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
        }
        .loader {
            opacity: 0.6;
            letter-spacing: 0.3em;
            font-size: 12px;
            text-transform: uppercase;
            animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
        }
    </style>
    <script>
        (function() {
            var isMobile = window.innerWidth <= 768 ||
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                window.location.replace('/mobile/');
            } else {
                window.location.replace('/dashboard/');
            }
        })();
    </script>
</head>
<body>
    <div>
        <p class="loader">Loading TourGuard AI...</p>
    </div>
</body>
</html>`;
fs.writeFileSync(path.join(deployDir, 'index.html'), indexContent);

console.log('--- Unified Build Complete! Output located in ./deploy ---');
