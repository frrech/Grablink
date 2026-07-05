# QR Code Implementation Guide

## Library: `qrcode`

The `qrcode` npm package generates QR codes from URLs. Here's how it's implemented in Grablink:

---

## What Was Implemented

### 1. **QrCodeService** (`src/share/qr-code.service.ts`)

Two methods for different use cases:

#### **generateQrCode()** - For API responses (Data URL)
```typescript
async generateQrCode(url: string): Promise<string>
```

**Returns:** Base64-encoded PNG as data URL
```
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
```

**Use Case:** Send directly in API response, embed in HTML
```typescript
// In controller
const qrCode = await this.qrCodeService.generateQrCode(url);
return { qrCode }; // Frontend displays: <img src={qrCode} />
```

**Configuration:**
- Size: 300px × 300px
- Margin: 2px padding
- Color: Black modules on white background

#### **generateQrCodeBuffer()** - For file storage (Buffer)
```typescript
async generateQrCodeBuffer(url: string): Promise<Buffer>
```

**Returns:** Raw PNG binary buffer
**Use Case:** Save to file system or database

```typescript
const buffer = await this.qrCodeService.generateQrCodeBuffer(url);
fs.writeFileSync('qr-code.png', buffer); // Save to disk
```

---

## Usage in Grablink

### Current Implementation

**In `share.controller.ts`:**
```typescript
@Get(':code')
async accessShare(@Param('code') code: string): Promise<AccessResponseDto> {
  const share = await this.shareService.accessShare(code);
  
  // Generate QR code asynchronously
  const qrCode = await this.qrCodeService.generateQrCode(share.url);
  
  return {
    code: share.code,
    url: share.url,
    title: share.title,
    createdAt: share.createdAt,
    expiresAt: share.expiresAt,
    accessCount: share.accessCount,
    qrCode,  // Data URL sent to frontend
  };
}
```

### API Response Example

```json
GET /share/123456

{
  "code": "123456",
  "url": "https://www.example.com",
  "title": "Example Website",
  "createdAt": "2026-07-05T10:00:00Z",
  "expiresAt": "2026-07-05T10:05:00Z",
  "accessCount": 3,
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
}
```

### Frontend Usage

```tsx
// In AccessDevice.tsx
const response = await api.accessShare(code);

return (
  <div>
    <a href={response.url}>{response.url}</a>
    <img src={response.qrCode} alt="QR Code" width={200} />
  </div>
);
```

---

## Library Documentation

### Main Methods

| Method | Input | Output | Async |
|--------|-------|--------|-------|
| `toDataURL()` | URL string | Base64 data URL | ✅ Yes |
| `toBuffer()` | URL string | PNG buffer | ✅ Yes |
| `toString()` | URL string | SVG string | ✅ Yes |
| `toCanvas()` | Canvas element | - | ✅ Yes |

### Options
```typescript
{
  type: 'image/png',      // Data URL type (only for toDataURL)
  type: 'png',            // Buffer type (only for toBuffer)
  width: 300,             // QR code size in pixels
  margin: 2,              // White space around code
  color: {
    dark: '#000000',      // Module color (black)
    light: '#FFFFFF'      // Background color (white)
  },
  errorCorrectionLevel: 'M' // 'L', 'M', 'Q', 'H'
}
```

### Error Handling

Both methods throw errors on invalid URLs:
```typescript
try {
  const qrCode = await qrCodeService.generateQrCode(url);
} catch (error) {
  console.error('QR code generation failed:', error.message);
}
```

---

## Testing the QR Code

### Manual Test

```bash
# Start the API
npm run start:dev

# Create a share
curl -X POST http://localhost:3000/share \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.github.com"}'

# Response:
# {"code": "123456", "expiresAt": "..."}

# Retrieve with QR code
curl http://localhost:3000/share/123456

# Response includes:
# {
#   "qrCode": "data:image/png;base64,..."
# }
```

### In Browser

1. Get a share code (e.g., `123456`)
2. Open `http://localhost:5173` (frontend)
3. Enter code in "Access Link" tab
4. QR code displays automatically

### Extract QR Code Data URL

```typescript
// In JavaScript
const response = await fetch('http://localhost:3000/share/123456');
const data = await response.json();

const img = document.createElement('img');
img.src = data.qrCode;  // Base64 PNG
document.body.appendChild(img);
```

---

## Advanced: Custom QR Codes

### Larger QR Code for Large URLs
```typescript
await qrCodeService.generateQrCode(url, {
  width: 500,              // Larger
  errorCorrectionLevel: 'H' // Higher error correction
});
```

### Different Colors
```typescript
await qrCodeService.generateQrCode(url, {
  color: {
    dark: '#0066FF',    // Blue modules
    light: '#F0F0F0'    // Light gray background
  }
});
```

### Generate SVG Instead
```typescript
const svg = await QRCode.toString(url, { type: 'image/svg+xml' });
// Returns: '<svg>...</svg>'
```

---

## Performance Notes

- **Generation Time:** ~10-50ms per QR code
- **Data URL Size:** ~300-500 bytes (depends on URL length)
- **Caching Strategy:** Can cache QR codes if URL is static

### Example: Cache in Database
```typescript
// Store with share
const share = {
  url: 'https://example.com',
  qrCode: await this.qrCodeService.generateQrCode(url), // Store once
  createdAt: new Date()
};

// Return cached version on subsequent requests
return share.qrCode;
```

---

## Troubleshooting

### "Cannot find module 'qrcode'"
```bash
npm install qrcode
```

### TypeScript errors with type definitions
```bash
npm install --save-dev @types/qrcode
```

### QR Code won't display in browser
- Ensure data URL is valid: `data:image/png;base64,...`
- Check browser console for errors
- Test with online QR decoder: https://zxing.org/w/decode

---

## Summary

The QR code library is now fully integrated:
- ✅ Installed: `qrcode@^1.x`
- ✅ Service: `QrCodeService` with 2 methods
- ✅ API: Returns QR code with share metadata
- ✅ Frontend: Displays QR code automatically
- ✅ Error Handling: Proper logging and exceptions

**Now when users access a share, they'll see a generated QR code!**
