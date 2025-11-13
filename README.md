# Google Images Scraper API

API server để crawl hình ảnh từ Google Images với metadata đầy đủ.

## 🚀 Cài đặt

```bash
npm install
```

## 📡 Chạy Server

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## 📋 API Endpoints

### POST `/api/crawl-images`

Crawl hình ảnh từ Google Images.

**Request Body:**
```json
{
    "url": "https://www.google.com/search?q=gach&tbm=isch",
    "maxImages": 50,
    "delayMin": 1000,
    "delayMax": 3000,
    "maxRequestsPerCrawl": 1000
}
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/...",
            "alt": "Đá granite",
            "title": "Đá granite",
            "sourceUrl": "https://example.com/product/...",
            "sourceTitle": "Gạch lát nền Đá granite",
            "nearbyText": "Gạch lát nền Đá granite cao cấp",
            "searchQuery": "gach",
            "crawledAt": "2025-10-30T02:32:53.933Z"
        }
    ]
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
    "status": "ok",
    "service": "Google Images Scraper API"
}
```

### GET `/`

Thông tin về API.

**Response:**
```json
{
    "service": "Google Images Scraper API",
    "version": "0.0.1",
    "endpoints": {
        "POST /api/crawl-images": "Crawl Google Images",
        "GET /health": "Health check"
    }
}
```

## 📝 Ví dụ sử dụng

### Sử dụng cURL

```bash
curl -X POST http://localhost:3000/api/crawl-images \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.google.com/search?q=gach&tbm=isch",
    "maxImages": 50,
    "delayMin": 1000,
    "delayMax": 3000,
    "maxRequestsPerCrawl": 1000
  }'
```

### Sử dụng JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/api/crawl-images', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://www.google.com/search?q=gach&tbm=isch',
    maxImages: 50,
    delayMin: 1000,
    delayMax: 3000,
    maxRequestsPerCrawl: 1000
  })
});

const data = await response.json();
console.log(data);
```

### Sử dụng Postman/Apify Console

1. Method: `POST`
2. URL: `http://localhost:3000/api/crawl-images`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
    "url": "https://www.google.com/search?q=gach&tbm=isch",
    "maxImages": 50,
    "delayMin": 1000,
    "delayMax": 3000,
    "maxRequestsPerCrawl": 1000
}
```

## ⚙️ Configuration

### Environment Variables

- `PORT`: Port để chạy server (default: 3000)

```bash
PORT=8080 npm start
```

## 📦 Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | ✅ | - | Google Images search URL |
| `maxImages` | number | ❌ | 50 | Số hình ảnh tối đa |
| `delayMin` | number | ❌ | 1000 | Delay tối thiểu (ms) |
| `delayMax` | number | ❌ | 3000 | Delay tối đa (ms) |
| `maxRequestsPerCrawl` | number | ❌ | 1000 | Số request tối đa |

## 🎯 Features

- ✅ Crawl Google Images với Puppeteer
- ✅ Extract metadata đầy đủ (URL, alt, source URL, title)
- ✅ Force tiếng Việt cho kết quả tiếng Việt
- ✅ Anti-detection mechanisms
- ✅ Human behavior simulation
- ✅ RESTful API với JSON response

## 🔧 Technologies

- **Node.js** >= 18.0.0
- **Express.js** - Web framework
- **Puppeteer** - Browser automation
- **Crawlee** - Web scraping framework

## 📄 License

ISC
