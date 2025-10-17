# 🚀 FOMI API Endpoints Specification

## Base Configuration
```
Base URL: https://api.fomi.com/v1
Authentication: Bearer Token (JWT)
Content-Type: application/json
```

---

## 🔐 Authentication Endpoints

### User Authentication
```javascript
// POST /auth/register
{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "John Doe",
  "avatar": "https://example.com/avatar.jpg" // optional
}

// Response
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "subscription": {
      "plan": "free",
      "credits": 10,
      "expiresAt": "2024-12-31T23:59:59Z"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt_token_here"
}

// POST /auth/login
{
  "email": "user@example.com",
  "password": "securepassword123"
}

// POST /auth/refresh
{
  "refreshToken": "refresh_token_here"
}

// POST /auth/logout
// Headers: Authorization: Bearer <token>
```

---

## 🎨 Image Generation API

### Text-to-Image Generation
```javascript
// POST /images/generate
{
  "prompt": "A beautiful sunset over mountains with vibrant colors",
  "negativePrompt": "blurry, low quality, distorted",
  "model": "stable-diffusion-xl", // optional, default
  "numImages": 4, // 1-4, default: 1
  "aspectRatio": "1:1", // "1:1", "16:9", "9:16", "4:3", "3:4"
  "quality": "standard", // "standard", "hd", "ultra-hd"
  "style": "photorealistic", // optional
  "seed": 12345, // optional, for reproducibility
  "guidanceScale": 7.5, // 1-20, default: 7.5
  "steps": 30, // 10-50, default: 30
  "safetyFilter": true, // optional, default: true
  "enhancePrompt": true // optional, default: false
}

// Response
{
  "success": true,
  "generation": {
    "id": "gen_123456",
    "status": "processing", // "pending", "processing", "completed", "failed"
    "progress": 0, // 0-100
    "images": [
      {
        "id": "img_123",
        "url": "https://storage.fomi.com/images/img_123.png",
        "thumbnail": "https://storage.fomi.com/thumbnails/img_123.jpg",
        "width": 1024,
        "height": 1024,
        "fileSize": 2048576,
        "seed": 12345
      }
    ],
    "prompt": "A beautiful sunset over mountains with vibrant colors",
    "model": "stable-diffusion-xl",
    "settings": {
      "aspectRatio": "1:1",
      "quality": "standard",
      "guidanceScale": 7.5,
      "steps": 30
    },
    "createdAt": "2024-01-01T12:00:00Z",
    "estimatedCompletion": "2024-01-01T12:02:00Z",
    "completedAt": null
  }
}

// GET /images/generate/{generationId}
// Response: Same as above with current status

// GET /images/generate/{generationId}/progress
{
  "success": true,
  "progress": 45,
  "status": "processing",
  "message": "Generating image 2 of 4..."
}
```

### Image-to-Image Generation
```javascript
// POST /images/variations
{
  "imageId": "img_123", // or base64 image data
  "prompt": "Same scene but at night", // optional
  "strength": 0.7, // 0.1-1.0, how much to change
  "numVariations": 4,
  "model": "stable-diffusion-xl",
  "guidanceScale": 7.5,
  "steps": 30
}

// Response: Same structure as text-to-image
```

### Image Editing
```javascript
// POST /images/edit
{
  "originalImageId": "img_123",
  "prompt": "Add a red car to the scene",
  "negativePrompt": "blurry, distorted",
  "model": "stable-diffusion-xl",
  "strength": 0.8,
  "guidanceScale": 7.5,
  "steps": 30
}
```

---

## 🎬 Video Generation API

### Text-to-Video Generation
```javascript
// POST /videos/generate
{
  "prompt": "A serene mountain landscape with flowing clouds and gentle sunlight",
  "negativePrompt": "blurry, low quality, distorted",
  "model": "stable-video-diffusion", // optional
  "duration": 15, // seconds, 5-30
  "fps": 24, // 24, 30, 60
  "resolution": "1080p", // "720p", "1080p", "4k"
  "aspectRatio": "16:9", // "16:9", "9:16", "1:1"
  "style": "cinematic", // optional
  "seed": 12345, // optional
  "guidanceScale": 7.5,
  "steps": 50,
  "motionStrength": 0.8, // 0.1-1.0
  "cameraMovement": "static" // "static", "pan", "zoom", "rotate"
}

// Response
{
  "success": true,
  "generation": {
    "id": "vid_123456",
    "status": "processing",
    "progress": 0,
    "video": {
      "url": "https://storage.fomi.com/videos/vid_123456.mp4",
      "thumbnail": "https://storage.fomi.com/thumbnails/vid_123456.jpg",
      "preview": "https://storage.fomi.com/previews/vid_123456.mp4", // low quality preview
      "duration": 15,
      "fps": 24,
      "resolution": "1080p",
      "fileSize": 52428800,
      "seed": 12345
    },
    "prompt": "A serene mountain landscape with flowing clouds and gentle sunlight",
    "model": "stable-video-diffusion",
    "settings": {
      "duration": 15,
      "fps": 24,
      "resolution": "1080p",
      "guidanceScale": 7.5,
      "steps": 50
    },
    "createdAt": "2024-01-01T12:00:00Z",
    "estimatedCompletion": "2024-01-01T12:05:00Z",
    "completedAt": null
  }
}

// GET /videos/generate/{generationId}
// GET /videos/generate/{generationId}/progress
```

### Video-to-Video Generation
```javascript
// POST /videos/variations
{
  "videoId": "vid_123",
  "prompt": "Same scene but with rain",
  "strength": 0.6,
  "duration": 15,
  "model": "stable-video-diffusion"
}
```

---

## 🎨 Image Enhancement API

### Image Upscaling
```javascript
// POST /images/enhance/upscale
{
  "imageId": "img_123", // or base64 image
  "scale": 4, // 2, 4, 8, "max"
  "model": "real-esrgan", // "real-esrgan", "swinir", "esrgan"
  "quality": "high", // "standard", "high", "ultra"
  "faceEnhancement": true, // optional
  "backgroundEnhancement": true // optional
}

// Response
{
  "success": true,
  "enhancement": {
    "id": "enh_123456",
    "status": "processing",
    "originalImage": {
      "id": "img_123",
      "url": "https://storage.fomi.com/images/img_123.png",
      "width": 512,
      "height": 512
    },
    "enhancedImage": {
      "id": "img_enh_123",
      "url": "https://storage.fomi.com/enhanced/img_enh_123.png",
      "width": 2048,
      "height": 2048,
      "fileSize": 8192000
    },
    "settings": {
      "scale": 4,
      "model": "real-esrgan",
      "quality": "high"
    },
    "createdAt": "2024-01-01T12:00:00Z",
    "completedAt": null
  }
}
```

### Image Quality Enhancement
```javascript
// POST /images/enhance/quality
{
  "imageId": "img_123",
  "enhancementType": "denoise", // "denoise", "sharpen", "color-correct", "all"
  "strength": 0.7, // 0.1-1.0
  "model": "enhancement-model"
}
```

### Background Removal/Replacement
```javascript
// POST /images/enhance/background
{
  "imageId": "img_123",
  "action": "remove", // "remove", "replace", "blur"
  "replacementBackground": "https://example.com/bg.jpg", // for replace action
  "blurStrength": 0.5 // for blur action
}
```

---

## 🖼️ Inpainting API

### Image Inpainting
```javascript
// POST /images/inpaint
{
  "imageId": "img_123",
  "mask": "base64_encoded_mask_image", // or mask coordinates
  "prompt": "A beautiful tree in the background",
  "negativePrompt": "blurry, distorted",
  "model": "stable-diffusion-inpaint",
  "guidanceScale": 7.5,
  "steps": 30,
  "maskBlur": 4, // pixels
  "inpaintArea": "masked", // "masked", "whole"
  "seed": 12345
}

// Response
{
  "success": true,
  "inpainting": {
    "id": "inp_123456",
    "status": "processing",
    "originalImage": {
      "id": "img_123",
      "url": "https://storage.fomi.com/images/img_123.png"
    },
    "mask": {
      "url": "https://storage.fomi.com/masks/mask_123.png"
    },
    "result": {
      "id": "img_inp_123",
      "url": "https://storage.fomi.com/inpainted/img_inp_123.png",
      "thumbnail": "https://storage.fomi.com/thumbnails/img_inp_123.jpg"
    },
    "prompt": "A beautiful tree in the background",
    "settings": {
      "model": "stable-diffusion-inpaint",
      "guidanceScale": 7.5,
      "steps": 30
    },
    "createdAt": "2024-01-01T12:00:00Z",
    "completedAt": null
  }
}
```

### Outpainting (Extend Image)
```javascript
// POST /images/outpaint
{
  "imageId": "img_123",
  "direction": "right", // "left", "right", "top", "bottom"
  "pixels": 256, // pixels to extend
  "prompt": "Continue the landscape to the right",
  "model": "stable-diffusion-outpaint"
}
```

---

## 🎨 Canvas Drawing API

### Save Canvas Drawing
```javascript
// POST /canvas/save
{
  "name": "My Drawing",
  "canvasData": "base64_encoded_canvas_data",
  "layers": [
    {
      "id": "layer_1",
      "name": "Background",
      "data": "base64_layer_data",
      "visible": true,
      "opacity": 1.0
    }
  ],
  "settings": {
    "width": 1024,
    "height": 1024,
    "backgroundColor": "#ffffff"
  },
  "tags": ["art", "drawing"],
  "isPublic": false
}

// Response
{
  "success": true,
  "canvas": {
    "id": "canvas_123",
    "name": "My Drawing",
    "url": "https://storage.fomi.com/canvas/canvas_123.png",
    "thumbnail": "https://storage.fomi.com/thumbnails/canvas_123.jpg",
    "layers": [...],
    "settings": {...},
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}

// GET /canvas/{canvasId}
// PUT /canvas/{canvasId}
// DELETE /canvas/{canvasId}
```

### AI-Assisted Drawing
```javascript
// POST /canvas/ai-assist
{
  "canvasId": "canvas_123",
  "prompt": "Add a mountain in the background",
  "area": {
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 200
  },
  "style": "sketch", // "sketch", "painting", "digital"
  "model": "canvas-ai-model"
}
```

---

## 🤖 Model Training API

### Start Model Training
```javascript
// POST /models/train
{
  "name": "My Custom Model",
  "description": "A model trained on my art style",
  "images": [
    {
      "url": "https://storage.fomi.com/training/img1.jpg",
      "caption": "Portrait of a woman",
      "weight": 1.0 // training weight
    }
  ],
  "trainingParams": {
    "model": "stable-diffusion-1.5", // base model
    "epochs": 100,
    "learningRate": 0.0001,
    "batchSize": 1,
    "resolution": 512,
    "scheduler": "cosine",
    "optimizer": "adamw"
  },
  "triggerWord": "myartstyle", // optional
  "category": "portrait", // optional
  "isPublic": false
}

// Response
{
  "success": true,
  "training": {
    "id": "train_123456",
    "name": "My Custom Model",
    "status": "uploading", // "uploading", "training", "completed", "failed"
    "progress": 0,
    "images": [...],
    "settings": {...},
    "model": {
      "id": null,
      "name": null,
      "url": null,
      "triggerWord": "myartstyle"
    },
    "createdAt": "2024-01-01T12:00:00Z",
    "estimatedCompletion": "2024-01-01T18:00:00Z",
    "completedAt": null
  }
}

// GET /models/train/{trainingId}
// GET /models/train/{trainingId}/progress
```

### Model Management
```javascript
// GET /models/custom
// Response: List of user's custom models

// GET /models/custom/{modelId}
// Response: Custom model details

// DELETE /models/custom/{modelId}

// POST /models/custom/{modelId}/share
{
  "isPublic": true,
  "description": "Public description",
  "tags": ["portrait", "art"]
}
```

---

## 🖼️ Gallery & Community API

### Personal Gallery
```javascript
// GET /gallery/personal?page=1&limit=20&type=all
{
  "success": true,
  "items": [
    {
      "id": "item_123",
      "type": "image", // "image", "video", "canvas"
      "url": "https://storage.fomi.com/images/img_123.png",
      "thumbnail": "https://storage.fomi.com/thumbnails/img_123.jpg",
      "prompt": "A beautiful sunset",
      "model": "stable-diffusion-xl",
      "createdAt": "2024-01-01T12:00:00Z",
      "tags": ["landscape", "sunset"],
      "isPublic": false,
      "downloads": 5,
      "likes": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasNext": true
  }
}

// POST /gallery/share
{
  "itemId": "item_123",
  "isPublic": true,
  "title": "My Beautiful Artwork",
  "description": "A stunning landscape I created",
  "tags": ["landscape", "art", "ai-generated"]
}
```

### Community Gallery
```javascript
// GET /gallery/community?page=1&limit=20&category=all&sort=latest
{
  "success": true,
  "items": [
    {
      "id": "item_123",
      "type": "image",
      "url": "https://storage.fomi.com/images/img_123.png",
      "thumbnail": "https://storage.fomi.com/thumbnails/img_123.jpg",
      "prompt": "A beautiful sunset",
      "author": {
        "id": "user_123",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "model": "stable-diffusion-xl",
      "createdAt": "2024-01-01T12:00:00Z",
      "likes": 45,
      "downloads": 23,
      "tags": ["landscape", "sunset"],
      "isLiked": false,
      "isDownloaded": false
    }
  ],
  "pagination": {...}
}

// POST /gallery/{itemId}/like
// POST /gallery/{itemId}/download
// GET /gallery/search?q=sunset&category=landscape
```

---

## 💳 Subscription & Credits API

### Subscription Management
```javascript
// GET /subscription
{
  "success": true,
  "subscription": {
    "plan": "pro", // "free", "basic", "pro", "enterprise"
    "status": "active", // "active", "cancelled", "expired"
    "credits": {
      "remaining": 1500,
      "total": 2500,
      "resetDate": "2024-02-01T00:00:00Z"
    },
    "limits": {
      "dailyGenerations": 100,
      "maxImagesPerGeneration": 4,
      "maxVideoDuration": 30,
      "customModels": 5,
      "priorityQueue": true
    },
    "features": {
      "advancedSettings": true,
      "customModels": true,
      "commercialUse": true,
      "apiAccess": true
    },
    "billing": {
      "cycle": "monthly", // "monthly", "yearly"
      "nextBilling": "2024-02-01T00:00:00Z",
      "amount": 20.00
    }
  }
}

// POST /subscription/upgrade
{
  "plan": "pro",
  "cycle": "monthly",
  "paymentMethod": "card_123"
}

// POST /subscription/cancel
// POST /subscription/reactivate
```

### Credit Management
```javascript
// GET /credits
{
  "success": true,
  "credits": {
    "remaining": 1500,
    "total": 2500,
    "resetDate": "2024-02-01T00:00:00Z",
    "history": [
      {
        "id": "credit_123",
        "amount": -1,
        "type": "image_generation",
        "description": "Generated 1 image",
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ]
  }
}

// POST /credits/purchase
{
  "package": "pro_1000", // credit package
  "amount": 1000,
  "paymentMethod": "card_123"
}
```

---

## ⚙️ Settings & Preferences API

### User Settings
```javascript
// GET /settings
{
  "success": true,
  "settings": {
    "profile": {
      "displayName": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "AI artist",
      "website": "https://example.com"
    },
    "preferences": {
      "theme": "light", // "light", "dark", "auto"
      "language": "en",
      "timezone": "UTC",
      "notifications": {
        "email": true,
        "push": true,
        "generationComplete": true,
        "trainingComplete": true
      }
    },
    "security": {
      "twoFactorEnabled": false,
      "lastPasswordChange": "2024-01-01T00:00:00Z"
    }
  }
}

// PUT /settings/profile
// PUT /settings/preferences
// PUT /settings/security
```

---

## 📊 Analytics & Usage API

### Usage Analytics
```javascript
// GET /analytics/usage?period=30d
{
  "success": true,
  "analytics": {
    "generations": {
      "total": 150,
      "images": 120,
      "videos": 30,
      "enhancements": 25
    },
    "credits": {
      "used": 500,
      "remaining": 1500,
      "efficiency": 0.85
    },
    "models": {
      "stable-diffusion-xl": 80,
      "stable-video-diffusion": 30,
      "custom-model-1": 40
    },
    "trends": {
      "daily": [...],
      "weekly": [...],
      "monthly": [...]
    }
  }
}
```

---

## 🔄 Real-time Updates (WebSocket)

### WebSocket Connection
```javascript
// Connect to: wss://api.fomi.com/v1/ws
// Authentication: Include token in connection headers

// Subscribe to events
{
  "type": "subscribe",
  "events": ["generation_progress", "training_progress", "system_notifications"]
}

// Generation Progress Event
{
  "type": "generation_progress",
  "generationId": "gen_123456",
  "progress": 45,
  "status": "processing",
  "message": "Generating image 2 of 4...",
  "timestamp": "2024-01-01T12:01:30Z"
}

// Training Progress Event
{
  "type": "training_progress",
  "trainingId": "train_123456",
  "progress": 67,
  "epoch": 67,
  "loss": 0.0234,
  "status": "training",
  "timestamp": "2024-01-01T12:01:30Z"
}
```

---

## 🚨 Error Responses

### Standard Error Format
```javascript
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "You don't have enough credits for this operation",
    "details": {
      "required": 1,
      "available": 0
    }
  }
}
```

### Common Error Codes
- `INVALID_PROMPT` - Prompt violates content policy
- `INSUFFICIENT_CREDITS` - User needs more credits
- `MODEL_UNAVAILABLE` - Selected model is down
- `FILE_TOO_LARGE` - Upload exceeds size limit
- `RATE_LIMITED` - Too many requests
- `AUTHENTICATION_FAILED` - Invalid or expired token
- `PERMISSION_DENIED` - User doesn't have permission
- `GENERATION_FAILED` - AI generation failed
- `TRAINING_FAILED` - Model training failed

---

## 📋 Rate Limits

### Default Limits
- **Free Plan**: 10 requests/minute, 100/day
- **Basic Plan**: 30 requests/minute, 500/day
- **Pro Plan**: 60 requests/minute, 2000/day
- **Enterprise**: 120 requests/minute, unlimited/day

### Headers
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

---

## 🔧 Environment Variables for Frontend

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.fomi.com/v1
NEXT_PUBLIC_WS_URL=wss://api.fomi.com/v1/ws

# File Storage
NEXT_PUBLIC_STORAGE_URL=https://storage.fomi.com

# Feature Flags
NEXT_PUBLIC_ENABLE_VIDEO_GENERATION=true
NEXT_PUBLIC_ENABLE_MODEL_TRAINING=true
NEXT_PUBLIC_ENABLE_COMMUNITY_FEATURES=true

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

This comprehensive API specification covers all generation services and features in FOMI! 🚀

