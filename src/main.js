// Express API Server for Google Images Scraper
import express from 'express';
import cors from 'cors';
// Crawlee - web scraping and browser automation library
import { PuppeteerCrawler, sleep } from 'crawlee';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function để tạo crawler và crawl
async function crawlGoogleImages(input) {
    const {
        url,
        maxImages = 50,
        delayMin = 1000,
        delayMax = 3000,
        maxRequestsPerCrawl = 1000,
    } = input;

    if (!url) {
        throw new Error('Bạn cần nhập url là link Google Images search!');
    }

    // Array để lưu kết quả
    const results = [];

    // Thêm timestamp và random param vào URL để tránh cache của Google và Crawlee
    const urlObj = new URL(url);
    urlObj.searchParams.set('_t', Date.now().toString());
    urlObj.searchParams.set('_r', Math.random().toString(36).substring(7));
    const uniqueUrl = urlObj.toString();

    // Crawl Google Images để lấy thông tin hình ảnh
    const crawler = new PuppeteerCrawler({
        requestHandlerTimeoutSecs: 180,
        minConcurrency: 1,
        maxConcurrency: 1,
        maxRequestsPerCrawl,
        launchContext: {
            launchOptions: {
                headless: true, // Chạy headless cho production
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-extensions-except',
                    '--disable-plugins-discovery',
                    '--disable-default-apps',
                    '--disable-sync',
                    '--disable-translate',
                    '--hide-scrollbars',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--no-pings',
                    '--password-store=basic',
                    '--use-mock-keychain',
                    '--disable-application-cache',
                    '--disable-background-networking',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-breakpad',
                    '--disable-client-side-phishing-detection',
                    '--disable-component-update',
                    '--disable-domain-reliability',
                    '--disable-features=AudioServiceOutOfProcess',
                    '--disable-hang-monitor',
                    '--disable-ipc-flooding-protection',
                    '--disable-notifications',
                    '--disable-offer-store-unmasked-wallet-cards',
                    '--disable-popup-blocking',
                    '--disable-print-preview',
                    '--disable-prompt-on-repost',
                    '--disable-renderer-backgrounding',
                    '--disable-setuid-sandbox',
                    '--disable-speech-api',
                    '--disable-sync',
                    '--disk-cache-size=0',
                    '--hide-scrollbars',
                    '--ignore-gpu-blacklist',
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                    '--ignore-ssl-errors',
                    '--media-cache-size=0',
                    '--metrics-recording-only',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--no-first-run',
                    '--no-pings',
                    '--no-sandbox',
                    '--no-zygote',
                    '--safebrowsing-disable-auto-update',
                    '--disable-software-rasterizer'
                ]
            }
        },
        // Pre navigation hook để clear cache và cookies
        preNavigationHooks: [
            async ({ page, request }) => {
                // Clear cookies trước mỗi lần navigate
                const client = await page.target().createCDPSession();
                await client.send('Network.clearBrowserCookies');
                await client.send('Network.clearBrowserCache');

                // Disable cache
                await page.setCacheEnabled(false);

                // Clear storage
                await page.evaluateOnNewDocument(() => {
                    localStorage.clear();
                    sessionStorage.clear();
                });
            }
        ],
        async requestHandler({ request, page, log }) {
            const searchUrl = request.loadedUrl;
            console.log(`Đang crawl: ${searchUrl}`);

            // Clear cookies và cache ngay khi page load
            try {
                const client = await page.target().createCDPSession();
                await client.send('Network.clearBrowserCookies');
                await client.send('Network.clearBrowserCache');
                await page.setCacheEnabled(false);
            } catch (e) {
                console.log('Không thể clear cache:', e.message);
            }

            // Set user agent ngẫu nhiên để tránh bị phát hiện
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15'
            ];
            const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
            await page.setUserAgent(randomUserAgent);

            // Set viewport ngẫu nhiên
            const viewports = [
                { width: 1920, height: 1080 },
                { width: 1366, height: 768 },
                { width: 1440, height: 900 },
                { width: 1536, height: 864 },
                { width: 1280, height: 720 }
            ];
            const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
            await page.setViewport(randomViewport);

            // Force tiếng Việt để có kết quả tiếng Việt
            const languages = ['vi-VN,vi;q=0.9,en;q=0.8', 'vi-VN,vi;q=0.8,en;q=0.7'];
            const randomLanguage = languages[Math.floor(Math.random() * languages.length)];

            await page.setExtraHTTPHeaders({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': randomLanguage,
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
            });

            // Force Google hiển thị tiếng Việt
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'language', {
                    get: function () { return 'vi-VN'; }
                });
                Object.defineProperty(navigator, 'languages', {
                    get: function () { return ['vi-VN', 'vi', 'en']; }
                });
            });

            try {
                // Force Google sử dụng tiếng Việt trong URL và thêm cache-busting params
                const currentUrl = page.url();
                console.log(`Current URL: ${currentUrl}`);

                if (currentUrl.includes('google.com')) {
                    const url = new URL(currentUrl);
                    const searchQuery = url.searchParams.get('q');
                    console.log(`Search query: ${searchQuery}`);

                    url.searchParams.set('hl', 'vi'); // Force tiếng Việt
                    url.searchParams.set('gl', 'VN'); // Force Vietnam
                    // Thêm cache-busting params
                    url.searchParams.set('_t', Date.now().toString());
                    url.searchParams.set('_r', Math.random().toString(36).substring(7));
                    const newUrl = url.toString();
                    console.log(`Redirecting to: ${newUrl}`);

                    // Navigate với cache disabled
                    await page.goto(newUrl, {
                        waitUntil: 'networkidle2',
                        cache: 'no-cache'
                    });
                }

                // Kiểm tra CAPTCHA hoặc trang kiểm tra robot
                const captchaCheck = await page.$('iframe[src*="recaptcha"], .g-recaptcha, #captcha, [data-captcha]');
                if (captchaCheck) {
                    log.error('Phát hiện CAPTCHA! Cần giải quyết thủ công hoặc thay đổi IP');
                    throw new Error('CAPTCHA detected - manual intervention required');
                }

                // Đợi trang load với thời gian ngẫu nhiên
                const initialDelay = Math.floor(Math.random() * 3000) + 2000; // 2-5 giây
                await sleep(initialDelay);

                // Mô phỏng hành vi người dùng thật
                console.log('Bắt đầu mô phỏng hành vi người dùng...');

                // Di chuyển chuột ngẫu nhiên
                await page.mouse.move(
                    Math.floor(Math.random() * 800) + 100,
                    Math.floor(Math.random() * 600) + 100
                );
                await sleep(Math.floor(Math.random() * 1000) + 500);

                // Scroll giống người dùng thật - không đều đặn
                let scrollCount = 0;
                const maxScrolls = Math.floor(Math.random() * 8) + 5; // 5-12 lần scroll

                while (scrollCount < maxScrolls) {
                    // Scroll với khoảng cách ngẫu nhiên
                    const scrollDistance = Math.floor(Math.random() * 400) + 200; // 200-600px
                    const scrollDelay = Math.floor(Math.random() * 2000) + 1000; // 1-3 giây

                    await page.evaluate((distance) => {
                        window.scrollBy({
                            top: distance,
                            behavior: 'smooth'
                        });
                    }, scrollDistance);

                    await sleep(scrollDelay);

                    // Thỉnh thoảng dừng lại để "đọc"
                    if (Math.random() < 0.3) {
                        const pauseTime = Math.floor(Math.random() * 3000) + 2000; // 2-5 giây
                        console.log(`Dừng lại ${pauseTime}ms để "đọc" nội dung...`);
                        await sleep(pauseTime);
                    }

                    // Hover vào một số hình ảnh
                    if (Math.random() < 0.4) {
                        try {
                            const images = await page.$$('img[src*="encrypted-tbn"], img[src*="googleusercontent"]');
                            if (images.length > 0) {
                                const randomImage = images[Math.floor(Math.random() * Math.min(images.length, 5))];
                                const box = await randomImage.boundingBox();
                                if (box) {
                                    await page.mouse.move(
                                        box.x + box.width / 2,
                                        box.y + box.height / 2
                                    );
                                    await sleep(Math.floor(Math.random() * 1500) + 500);
                                }
                            }
                        } catch (e) {
                            // Ignore hover errors
                        }
                    }

                    scrollCount++;

                    // Kiểm tra số hình ảnh đã load
                    const currentImages = await page.$$('img[src*="encrypted-tbn"], img[src*="googleusercontent"], img[src*="gstatic"]');
                    console.log(`Lần scroll ${scrollCount}: Tìm thấy ${currentImages.length} hình ảnh`);

                    if (currentImages.length >= maxImages * 0.8) break; // Dừng khi đã có đủ hình
                }

                // Click vào 1-2 hình ảnh ngẫu nhiên (không quá nhiều)
                try {
                    const imageContainers = await page.$$('.rg_l, .islrc, [data-ved]');
                    if (imageContainers.length > 0) {
                        const clickCount = Math.floor(Math.random() * 2) + 1; // 1-2 lần click
                        console.log(`Sẽ click vào ${clickCount} hình ảnh`);

                        for (let i = 0; i < Math.min(clickCount, imageContainers.length); i++) {
                            try {
                                const randomIndex = Math.floor(Math.random() * imageContainers.length);
                                await imageContainers[randomIndex].click();
                                await sleep(Math.floor(Math.random() * 2000) + 1000); // 1-3 giây
                            } catch (e) {
                                // Ignore click errors
                            }
                        }
                    }
                } catch (e) {
                    console.log('Không thể click vào container hình ảnh');
                }

                // Scroll cuối cùng đến cuối trang
                await page.evaluate(() => {
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                    });
                });

                // Đợi thêm để hình ảnh load hoàn toàn
                const finalDelay = Math.floor(Math.random() * 3000) + 3000; // 3-6 giây
                await sleep(finalDelay);

                const images = await page.evaluate((maxImages) => {
                    const imageElements = [];
                    const processedUrls = new Set();

                    // Tìm tất cả hình ảnh với nhiều selector khác nhau
                    const selectors = [
                        'img[src*="encrypted-tbn"]',
                        'img[src*="googleusercontent"]',
                        'img[src*="gstatic"]',
                        '.rg_l img',
                        '.islrc img',
                        '[data-ved] img',
                        'img[alt*="gach"]',
                        'img[alt*="gạch"]'
                    ];

                    let allImages = [];
                    selectors.forEach(selector => {
                        const imgs = document.querySelectorAll(selector);
                        allImages = allImages.concat(Array.from(imgs));
                    });

                    // Loại bỏ duplicate
                    const uniqueImages = [...new Set(allImages)];
                    console.log(`Tìm thấy ${uniqueImages.length} hình ảnh unique`);

                    for (const img of uniqueImages) {
                        if (imageElements.length >= maxImages) break;

                        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');

                        // Lấy alt text từ nhiều nguồn khác nhau
                        let alt = img.alt ||
                            img.getAttribute('aria-label') ||
                            img.getAttribute('data-alt') ||
                            img.getAttribute('data-title') ||
                            '';

                        // Nếu không có alt, thử lấy từ container hoặc nearby text
                        if (!alt) {
                            const container = img.closest('[data-ved], .rg_l, .islrc, .rg_i, .islir');
                            if (container) {
                                // Tìm các element có thể chứa alt text
                                const altCandidates = [
                                    container.querySelector('[aria-label]')?.getAttribute('aria-label'),
                                    container.querySelector('[title]')?.getAttribute('title'),
                                    container.querySelector('span')?.textContent?.trim(),
                                    container.querySelector('div')?.textContent?.trim(),
                                    container.textContent?.trim()
                                ].filter(text => text && text.length > 0);

                                if (altCandidates.length > 0) {
                                    // Chọn text ngắn nhất và có ý nghĩa nhất
                                    alt = altCandidates.reduce((shortest, current) => {
                                        if (current.length < shortest.length && current.length > 3) {
                                            return current;
                                        }
                                        return shortest;
                                    });

                                    // Làm sạch alt text
                                    alt = alt.replace(/\s+/g, ' ').trim();
                                    if (alt.length > 100) alt = alt.substring(0, 100) + '...';
                                }
                            }
                        }

                        const title = img.title || '';

                        // Lọc hình ảnh hợp lệ
                        if (src &&
                            src.length > 10 &&
                            !src.includes('data:image/gif;base64') &&
                            !src.includes('data:image') &&
                            !src.includes('google.com/logos') &&
                            !src.includes('google.com/tia') &&
                            !processedUrls.has(src)) {

                            // Tìm container và thông tin liên quan
                            let container = img.closest('[data-ved], .rg_l, .islrc, .rg_i, .islir');
                            let sourceUrl = '';
                            let sourceTitle = '';
                            let nearbyText = '';

                            if (container) {
                                // Tìm link nguồn với nhiều selector khác nhau
                                const linkSelectors = [
                                    'a[href*="http"]', // Link có href chứa http
                                    'a.umNKYc', // Link với class umNKYc (như trong hình)
                                    'a[data-ved]', // Link có data-ved
                                    'a', // Bất kỳ link nào
                                    '[data-ved] a', // Link trong container có data-ved
                                    '.rg_l a', // Link trong container rg_l
                                    '.islrc a' // Link trong container islrc
                                ];

                                for (const selector of linkSelectors) {
                                    const linkElement = container.querySelector(selector);
                                    if (linkElement && linkElement.href && linkElement.href.startsWith('http')) {
                                        sourceUrl = linkElement.href;
                                        sourceTitle = linkElement.title ||
                                            linkElement.textContent?.trim() ||
                                            linkElement.getAttribute('aria-label') || '';
                                        break; // Tìm thấy link hợp lệ thì dừng
                                    }
                                }

                                // Nếu không tìm thấy trong container, tìm trong các element cha
                                if (!sourceUrl) {
                                    let parent = img.parentElement;
                                    let searchDepth = 0;
                                    const maxDepth = 5; // Giới hạn độ sâu tìm kiếm

                                    while (parent && searchDepth < maxDepth) {
                                        for (const selector of linkSelectors) {
                                            const linkElement = parent.querySelector(selector);
                                            if (linkElement && linkElement.href && linkElement.href.startsWith('http')) {
                                                sourceUrl = linkElement.href;
                                                sourceTitle = linkElement.title ||
                                                    linkElement.textContent?.trim() ||
                                                    linkElement.getAttribute('aria-label') || '';
                                                break;
                                            }
                                        }
                                        if (sourceUrl) break;
                                        parent = parent.parentElement;
                                        searchDepth++;
                                    }
                                }

                                // Tìm text gần đó
                                nearbyText = container.textContent?.trim() || '';
                            }

                            // Nếu vẫn chưa có sourceUrl, thử tìm trong toàn bộ DOM gần đó
                            if (!sourceUrl) {
                                // Tìm tất cả link trong phạm vi gần hình ảnh
                                const nearbyLinks = document.querySelectorAll('a[href*="http"]');
                                for (const link of nearbyLinks) {
                                    const linkRect = link.getBoundingClientRect();
                                    const imgRect = img.getBoundingClientRect();

                                    // Kiểm tra khoảng cách giữa link và hình ảnh
                                    const distance = Math.sqrt(
                                        Math.pow(linkRect.left - imgRect.left, 2) +
                                        Math.pow(linkRect.top - imgRect.top, 2)
                                    );

                                    // Nếu link gần hình ảnh (trong vòng 200px)
                                    if (distance < 200 && link.href && link.href.startsWith('http')) {
                                        sourceUrl = link.href;
                                        sourceTitle = link.title || link.textContent?.trim() || '';
                                        break;
                                    }
                                }
                            }

                            // Lấy thông tin từ các element cha
                            const parentText = img.parentElement?.textContent?.trim() || '';
                            const grandParentText = img.parentElement?.parentElement?.textContent?.trim() || '';

                            imageElements.push({
                                imageUrl: src,
                                alt: alt,
                                title: alt, // Sử dụng alt text làm title
                                sourceUrl: sourceUrl,
                                sourceTitle: sourceTitle,
                                nearbyText: nearbyText || parentText || grandParentText,
                                searchQuery: new URL(window.location.href).searchParams.get('q') || '',
                                crawledAt: new Date().toISOString()
                            });

                            processedUrls.add(src);
                        }
                    }

                    return imageElements;
                }, maxImages);

                console.log(`Đã tìm thấy ${images.length} hình ảnh`);

                // Lọc bỏ các bản ghi thiếu thông tin quan trọng
                const filteredImages = images.filter((image) => {
                    return Boolean(
                        image.imageUrl &&
                        image.alt &&
                        image.sourceUrl &&
                        image.nearbyText
                    );
                });

                console.log(`Sau khi lọc còn ${filteredImages.length} hình ảnh hợp lệ`);

                // Thêm vào results array
                results.push(...filteredImages);

            } catch (error) {
                console.error(`Lỗi khi crawl: ${error.message}`);
                throw error;
            }
        }
    });

    await crawler.run([uniqueUrl]);

    return results;
}

// API Endpoint: POST /api/crawl-images
app.post('/api/crawl-images', async (req, res) => {
    try {
        const input = req.body;

        console.log('Received request:', JSON.stringify(input, null, 2));

        // Validate input
        if (!input.url) {
            return res.status(400).json({
                success: false,
                error: 'Bạn cần nhập url là link Google Images search!'
            });
        }

        // Crawl images
        const data = await crawlGoogleImages(input);

        // Trả về response giống format trong ảnh
        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Google Images Scraper API' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Google Images Scraper API',
        version: '0.0.1',
        endpoints: {
            'POST /api/crawl-images': 'Crawl Google Images',
            'GET /health': 'Health check'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📡 API endpoint: POST http://localhost:${PORT}/api/crawl-images`);
    console.log(`💚 Health check: GET http://localhost:${PORT}/health`);
});
