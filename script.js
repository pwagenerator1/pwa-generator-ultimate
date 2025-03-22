function generatePWA() {
    const appName = document.getElementById('appName').value.trim();
    const shortName = document.getElementById('shortName').value.trim().slice(0, 12);
    const siteUrl = document.getElementById('siteUrl').value.trim();
    const displayMode = document.getElementById('displayMode').value;
    const themeColor = document.getElementById('themeColor').value;
    const bgColor = document.getElementById('bgColor').value;
    const iconFile = document.getElementById('iconUpload').files[0];
    const cacheUrls = document.getElementById('cacheUrls').value.trim().split('\n').filter(url => url);

    if (!appName || !shortName || !siteUrl || !/^https?:\/\//.test(siteUrl)) {
        alert('Please fill all required fields with a valid URL!');
        return;
    }

    const manifest = {
        name: appName,
        short_name: shortName,
        start_url: siteUrl,
        display: displayMode,
        background_color: bgColor,
        theme_color: themeColor,
        icons: [
            {
                src: iconFile ? URL.createObjectURL(iconFile) : `${siteUrl}/icon.png`,
                sizes: '192x192',
                type: 'image/png'
            }
        ]
    };

    const swCode = `
const CACHE_NAME = '${shortName}-cache-v1';
const urlsToCache = ['${siteUrl}', ...${JSON.stringify(cacheUrls)}];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => 
            caches.match(event.request).then((response) => response || new Response('Offline'))
        )
    );
});
    `;

    const htmlSnippet = `
<link rel="manifest" href="/manifest.json">
<script>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.log('Error:', err));
}
</script>
    `;

    document.getElementById('manifestOutput').textContent = JSON.stringify(manifest, null, 2);
    document.getElementById('swOutput').textContent = swCode;
    document.getElementById('htmlSnippet').textContent = htmlSnippet;
    document.getElementById('output').style.display = 'block';
    Prism.highlightAll();

    const previewFrame = document.getElementById('previewFrame');
    previewFrame.contentDocument.open();
    previewFrame.contentDocument.write(`
        <html>
        <head>
            <meta name="theme-color" content="${themeColor}">
            <style>body { background: ${bgColor}; text-align: center; padding: 20px; }</style>
        </head>
        <body>
            <h1>Welcome to ${appName}</h1>
            <p>This is a preview of your PWA!</p>
        </body>
        </html>
    `);
    previewFrame.contentDocument.close();
}

function copyCode(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
}

function downloadZip() {
    const zip = new JSZip();
    zip.file('manifest.json', document.getElementById('manifestOutput').textContent);
    zip.file('service-worker.js', document.getElementById('swOutput').textContent);
    zip.file('index.html', `<html><head>${document.getElementById('htmlSnippet').textContent}</head><body><h1>${document.getElementById('appName').value}</h1></body></html>`);
    zip.generateAsync({ type: 'blob' }).then((content) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'pwa-files.zip';
        link.click();
    });
}

document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    document.getElementById('themeToggle').textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
});