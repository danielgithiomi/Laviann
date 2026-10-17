// Bounded readiness check for the two local CI app servers.
const urls = process.argv.slice(2);
if (!urls.length) throw new Error('Pass the local URLs to check.');
for (const url of urls) {
    if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname)) throw new Error('Local URLs only.');
}
await Promise.all(
    urls.map(async url => {
        const deadline = Date.now() + 90_000;
        while (Date.now() < deadline) {
            try {
                const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
                if (response.ok) return;
            } catch {
                /* Retry while the server compiles its first route. */
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        throw new Error(`Local app did not become ready: ${url}`);
    }),
);
console.log('Both local apps are ready.');
