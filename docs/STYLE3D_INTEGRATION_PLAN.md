# Style3D Integration - Technical Architecture Plan
**Date:** December 3, 2025
**Branch:** ColorFlex Clothing Mode → Style3D Avatar + Parametric Patterns
**Status:** Planning Phase

---

## Overview

Integrate Style3D body scanning and parametric pattern generation into ColorFlex's clothing branch to enable:
- Custom-fit garment visualization
- Avatar-based pattern scaling
- Automated production file generation (DXF)
- Kiosk-ready scanning and preview

---

## Architecture Decisions

### Branch Strategy
This will be implemented as **Mode Enhancement** to the existing clothing mode, NOT a separate fourth branch.

**Why:**
- ColorFlex already has 3 modes (WALLPAPER, FURNITURE, CLOTHING)
- Style3D features are **additions** to CLOTHING mode
- Enables progressive rollout: Start with basic clothing → Add Style3D features
- Maintains single codebase with feature flags

### Mode Configuration Extension
```javascript
// src/config/colorFlex-modes.js

CLOTHING: {
  // ... existing config ...

  features: {
    // Existing features
    colorLock: true,
    downloadProof: true,
    saveDesigns: true,

    // NEW: Style3D features
    style3d: {
      enabled: false, // Feature flag - enable when ready
      avatarScanning: true,
      parametricPatterns: true,
      fitPreview: true,
      kioskMode: true
    }
  },

  style3d: {
    apiBaseUrl: process.env.STYLE3D_API_URL,
    apiKey: process.env.STYLE3D_API_KEY,
    avatarStoragePath: '/data/users/{id}/avatar.glb',
    measurementsPath: '/data/users/{id}/measurements.json',
    patternsPath: '/production/patterns/user_{id}/{pattern}.dxf'
  }
}
```

---

## Directory Structure

```
/colorflex-shopify/
│
├── src/
│   ├── style3d/                     # NEW: Style3D integration module
│   │   ├── client/                  # API client
│   │   │   ├── Style3DClient.js     # Main API wrapper
│   │   │   ├── endpoints/
│   │   │   │   ├── avatar.js        # Body scan endpoints
│   │   │   │   ├── garment.js       # Garment API endpoints
│   │   │   │   └── pattern.js       # Pattern endpoints
│   │   │   └── auth.js              # Authentication
│   │   │
│   │   ├── avatar/                  # Avatar handling
│   │   │   ├── fetchAvatar.js       # Fetch from Style3D
│   │   │   ├── storeAvatar.js       # Save locally
│   │   │   ├── normalizeMeasurements.js
│   │   │   └── avatarSchema.js      # Measurement data schema
│   │   │
│   │   ├── garment/                 # Garment scaling
│   │   │   ├── scaleGarment.js      # Scale based on measurements
│   │   │   ├── applyTexture.js      # Apply ColorFlex patterns
│   │   │   └── fitCalculator.js     # Calculate fit adjustments
│   │   │
│   │   ├── pattern/                 # Parametric patterns
│   │   │   ├── uploadPattern.js     # Upload to Style3D
│   │   │   ├── requestFit.js        # Request fitted DXF
│   │   │   └── exportDXF.js         # Export for production
│   │   │
│   │   ├── viewer/                  # 3D visualization
│   │   │   ├── AvatarViewer.js      # Three.js avatar loader
│   │   │   ├── GarmentPreview.js    # Garment on avatar
│   │   │   └── controls.js          # Camera/interaction
│   │   │
│   │   └── kiosk/                   # Kiosk mode
│   │       ├── scanFlow.js          # Guided photo capture
│   │       ├── terminal.js          # Kiosk UI integration
│   │       └── printQueue.js        # DSN job creation
│   │
│   ├── api/                         # NEW: Server endpoints
│   │   └── style3d/
│   │       ├── avatar.js            # GET/POST /api/style3d/avatar
│   │       ├── measurements.js      # GET /api/style3d/measurements
│   │       ├── garment.js           # POST /api/style3d/garment/fit
│   │       └── pattern.js           # POST /api/style3d/pattern/export
│   │
│   └── templates/
│       └── page.colorflex-clothing.liquid  # Enhanced with Style3D UI
│
├── data/
│   └── users/                       # NEW: User data storage
│       └── {user_id}/
│           ├── avatar.glb           # 3D avatar mesh
│           ├── measurements.json    # Body measurements
│           └── patterns/            # Adjusted DXF files
│               └── {pattern_name}.dxf
│
├── production/                      # NEW: Production files
│   └── patterns/
│       └── user_{id}/
│           └── {pattern}.dxf        # Ready for DSN/laser
│
└── scripts/
    └── style3d/                     # Batch processing
        ├── batch-render-avatars.js  # Blender batch
        └── sync-measurements.js     # Airtable sync
```

---

## Data Schema Extensions

### User Record (Shopify Customer Metafields)
```json
{
  "customer_id": "123456",
  "email": "customer@example.com",

  "style3d": {
    "avatar_id": "s3d_avatar_xyz789",
    "avatar_url": "https://so-animation.com/colorflex/data/users/123456/avatar.glb",
    "measurements": {
      "height": 172,
      "bust": 88,
      "waist": 70,
      "hip": 94,
      "inseam": 78,
      "shoulder": 40,
      "arm_length": 58
    },
    "parametric_factors": {
      "scale_x": 1.06,
      "scale_y": 0.97,
      "scale_z": 1.02
    },
    "scan_date": "2025-12-03T18:30:00Z",
    "scan_method": "kiosk_photo" // or "mobile_app"
  }
}
```

### Order Metafields (Production Integration)
```json
{
  "order_id": "987654",
  "line_items": [{
    "product": "Custom Fitted Dress",
    "colorflex": {
      "pattern": "vogue_2026_gown_03",
      "collection": "botanicals.clo-1",
      "colors": ["SW7006", "SW6258"],
      "texture_url": "https://so-animation.com/colorflex/textures/...",
      "scale": 100,

      // NEW: Style3D data
      "avatar_id": "s3d_avatar_xyz789",
      "measurements": { /* ... */ },
      "adjusted_pattern_dxf": "https://so-animation.com/colorflex/production/patterns/user_123456/vogue_2026_gown_03.dxf",
      "fit_preview_url": "https://so-animation.com/colorflex/previews/user_123456_order_987654.png",
      "garment_mesh": "https://so-animation.com/colorflex/data/users/123456/garment_fitted.glb"
    }
  }]
}
```

### Collections.json Extension (Pattern Metadata)
```json
{
  "name": "vogue-patterns",
  "patterns": [{
    "name": "Vogue 2026 Gown",
    "id": "vogue_2026_gown_03",

    // NEW: Style3D integration
    "style3d": {
      "pattern_id": "s3d_pattern_abc123",
      "base_dxf": "/patterns/vogue_2026_gown_03_base.dxf",
      "garment_type": "dress",
      "size_range": ["XS", "S", "M", "L", "XL"],
      "parametric": true,
      "fit_points": ["bust", "waist", "hip", "length"]
    }
  }]
}
```

---

## API Endpoints Design

### 1. Avatar Management

**POST /api/style3d/avatar/scan**
```javascript
// Request body
{
  "user_id": "123456",
  "photos": ["base64_image_1", "base64_image_2", ...],
  "scan_method": "kiosk_photo"
}

// Response
{
  "avatar_id": "s3d_avatar_xyz789",
  "avatar_url": "/data/users/123456/avatar.glb",
  "measurements": { /* ... */ },
  "status": "processed"
}
```

**GET /api/style3d/avatar/:user_id**
```javascript
// Response
{
  "avatar_url": "/data/users/123456/avatar.glb",
  "measurements": { /* ... */ },
  "scan_date": "2025-12-03T18:30:00Z"
}
```

### 2. Garment Fitting

**POST /api/style3d/garment/fit**
```javascript
// Request
{
  "user_id": "123456",
  "pattern_id": "vogue_2026_gown_03",
  "measurements": { /* ... */ }
}

// Response
{
  "fitted_garment_url": "/data/users/123456/garment_fitted.glb",
  "adjusted_dxf_url": "/production/patterns/user_123456/vogue_2026_gown_03.dxf",
  "fit_score": 0.94, // 0-1 scale
  "adjustments": {
    "bust": "+2cm",
    "waist": "-1cm",
    "length": "+3cm"
  }
}
```

### 3. Pattern Export (for DSN/Production)

**POST /api/style3d/pattern/export**
```javascript
// Request
{
  "order_id": "987654",
  "user_id": "123456",
  "pattern_id": "vogue_2026_gown_03",
  "format": "dxf" // or "svg", "pdf"
}

// Response
{
  "export_url": "/production/patterns/user_123456/vogue_2026_gown_03.dxf",
  "print_ready": true,
  "fabric_length_meters": 2.4,
  "cutting_instructions": "url_to_pdf"
}
```

---

## Three.js Integration (Web Preview)

### Avatar Loader
```javascript
// src/style3d/viewer/AvatarViewer.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class AvatarViewer {
  constructor(container, options = {}) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.avatar = null;
    this.garment = null;
    this.measurements = null;

    this.init();
  }

  async loadAvatar(avatarUrl) {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(avatarUrl);
    this.avatar = gltf.scene;
    this.scene.add(this.avatar);
    return this.avatar;
  }

  async loadGarment(garmentUrl, measurements) {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(garmentUrl);
    this.garment = gltf.scene;

    // Auto-scale garment to avatar measurements
    this.scaleGarmentToAvatar(measurements);

    this.scene.add(this.garment);
    return this.garment;
  }

  scaleGarmentToAvatar(measurements) {
    if (!this.avatar || !this.garment) return;

    // Calculate bounding boxes
    const avatarBox = new THREE.Box3().setFromObject(this.avatar);
    const garmentBox = new THREE.Box3().setFromObject(this.garment);

    const avatarSize = avatarBox.getSize(new THREE.Vector3());
    const garmentSize = garmentBox.getSize(new THREE.Vector3());

    // Scale garment to avatar with slight offset for fit
    const scale = avatarSize.divide(garmentSize).multiplyScalar(0.98);
    this.garment.scale.copy(scale);

    console.log('🎽 Garment scaled:', scale);
  }

  applyColorFlexTexture(textureUrl) {
    if (!this.garment) return;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(textureUrl, (texture) => {
      this.garment.traverse((child) => {
        if (child.isMesh) {
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      });
      console.log('🎨 ColorFlex texture applied');
    });
  }
}

export default AvatarViewer;
```

### Integration into ColorFlex Clothing Page
```javascript
// In page.colorflex-clothing.liquid

<div id="style3d-preview" style="display: none; width: 100%; height: 600px;">
  <canvas id="avatar-canvas"></canvas>
</div>

<script type="module">
import AvatarViewer from './style3d/viewer/AvatarViewer.js';

// Check if user has avatar
const userId = window.Shopify?.customer?.id;
if (userId) {
  fetch(`/api/style3d/avatar/${userId}`)
    .then(r => r.json())
    .then(data => {
      if (data.avatar_url) {
        // Show 3D preview mode
        document.getElementById('style3d-preview').style.display = 'block';

        const viewer = new AvatarViewer(
          document.getElementById('avatar-canvas')
        );

        viewer.loadAvatar(data.avatar_url);

        // When pattern selected, load garment
        window.addEventListener('colorflex:patternSelected', (e) => {
          const pattern = e.detail.pattern;
          if (pattern.style3d?.garment_mesh) {
            viewer.loadGarment(pattern.style3d.garment_mesh, data.measurements);
            viewer.applyColorFlexTexture(e.detail.textureUrl);
          }
        });
      }
    });
}
</script>
```

---

## Kiosk Integration Flow

### Step-by-Step User Experience

```
┌─────────────────────────────────────────────────┐
│  1. KIOSK LAUNCH                                │
│  Salesperson: Click "Style3D Scan Suite"       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. GUIDED PHOTO CAPTURE                        │
│  - Front view (arms at sides)                   │
│  - Side view (profile)                          │
│  - Back view                                    │
│  - Optional: Arms extended for shoulder width   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. STYLE3D PROCESSING                          │
│  POST /style3d/avatar/scan                      │
│  → Avatar generated                             │
│  → Measurements extracted                       │
│  → Stored in /data/users/{id}/                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4. COLORFLEX CLOTHING INTERFACE                │
│  - Avatar loads in 3D viewer                    │
│  - Customer browses clothing patterns           │
│  - Selects fabric and ColorFlex pattern         │
│  - Real-time preview on their avatar            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  5. FIT ADJUSTMENT                              │
│  POST /style3d/garment/fit                      │
│  → Parametric pattern adjusted                  │
│  → DXF generated for their measurements         │
│  → Fit score displayed (94%)                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  6. ORDER CREATION                              │
│  - Add to cart with avatar + measurements       │
│  - Order metafields populated                   │
│  - DXF attached for production                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  7. AUTOMATED PRODUCTION                        │
│  - DSN receives order + DXF                     │
│  - Solid Stone Fabrics prints texture           │
│  - Laser cutter processes tabbed pattern        │
│  - Sewers receive cut fabric + instructions     │
└─────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up directory structure
- [ ] Create Style3D API client skeleton
- [ ] Extend ColorFlex schema (user records, measurements)
- [ ] Add feature flags to clothing mode config
- [ ] Create mock endpoints for testing without Style3D access

### Phase 2: Avatar Integration (Week 3-4)
- [ ] Implement avatar fetching from Style3D
- [ ] Build avatar storage system (`/data/users/`)
- [ ] Create measurement normalization logic
- [ ] Add GET /api/style3d/avatar/:user_id endpoint
- [ ] Test with sample avatar files

### Phase 3: 3D Viewer (Week 5-6)
- [ ] Build Three.js AvatarViewer component
- [ ] Implement garment loading and scaling
- [ ] Add ColorFlex texture application
- [ ] Integrate viewer into clothing page
- [ ] Add camera controls and UI

### Phase 4: Parametric Patterns (Week 7-8)
- [ ] Upload base Vogue patterns to Style3D
- [ ] Implement POST /api/style3d/garment/fit
- [ ] Build DXF export pipeline
- [ ] Create production file storage system
- [ ] Test with actual garment patterns

### Phase 5: Shopify Integration (Week 9-10)
- [ ] Add metafields to customer records
- [ ] Extend order metafields for production data
- [ ] Build cart integration (avatar + measurements → order)
- [ ] Create DSN automation (order → DXF → job queue)
- [ ] Test full order flow

### Phase 6: Kiosk Mode (Week 11-12)
- [ ] Design kiosk UI/UX flow
- [ ] Implement guided photo capture
- [ ] Add scanning progress indicators
- [ ] Build salesperson terminal view
- [ ] Test in physical kiosk environment

---

## Environment Variables

```bash
# .env additions

# Style3D API
STYLE3D_API_URL=https://api.style3d.com/v1
STYLE3D_API_KEY=your_api_key_here
STYLE3D_API_SECRET=your_api_secret_here

# Storage paths
AVATAR_STORAGE_PATH=/data/users
PATTERN_STORAGE_PATH=/production/patterns

# Feature flags
STYLE3D_ENABLED=false
STYLE3D_KIOSK_MODE=false
STYLE3D_PARAMETRIC_PATTERNS=false
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "three": "^0.160.0",
    "axios": "^1.6.0",
    "form-data": "^4.0.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0"
  }
}
```

---

## Testing Strategy

### Unit Tests
- Style3D API client
- Measurement normalization
- Garment scaling algorithms
- DXF export functions

### Integration Tests
- Avatar fetch → store → retrieve flow
- Pattern upload → fit request → DXF export
- Shopify metafield updates
- Full order creation flow

### Manual Testing
- 3D viewer performance
- Garment fit accuracy
- Kiosk photo capture quality
- Production file validity (DXF in CAD software)

---

## Questions for Style3D Team

Before implementation, we need answers to:

1. **API Access:**
   - What is the authentication method? (API key, OAuth, JWT?)
   - Are there rate limits?
   - What is the SLA for avatar processing time?

2. **Avatar Format:**
   - What file formats are supported for avatar export? (GLB, OBJ, FBX?)
   - Are textures included with the avatar mesh?
   - What is the typical polygon count?

3. **Measurement System:**
   - What measurement points are captured?
   - Are measurements in cm or inches?
   - Is there a standard schema/format?

4. **Garment API:**
   - What file formats for garment upload? (DXF, CLO3D, OBJ?)
   - Does Style3D provide a garment library, or do we upload all patterns?
   - Can we request real-time fit simulation, or is it batch-processed?

5. **Rendering:**
   - Does Style3D provide a WebGL viewer SDK?
   - Or do we need to build our own Three.js implementation?
   - Are there texture/material presets for fabrics?

6. **Parametric Engine:**
   - How does the parametric adjustment work?
   - What input parameters does it accept?
   - What is the output format (adjusted DXF, grading data, etc.)?

---

## Risk Assessment

### High Risk
- **Style3D API availability** - Entire system depends on external service
  - *Mitigation:* Build with mock data, cache avatars locally, graceful fallback to 2D mockups

- **Avatar processing time** - May be too slow for real-time kiosk use
  - *Mitigation:* Progress indicators, asynchronous processing, pre-scan in appointment scheduling

### Medium Risk
- **Three.js performance** - Large avatar/garment meshes may lag on mobile
  - *Mitigation:* LOD (level of detail) system, texture compression, WebGL optimization

- **DXF compatibility** - Exported patterns may not work with DSN's systems
  - *Mitigation:* Early testing with production team, format validation, manual review option

### Low Risk
- **Storage costs** - Avatar files could accumulate quickly
  - *Mitigation:* Compression, retention policy (delete after 90 days), CDN caching

---

## Success Metrics

### Technical KPIs
- Avatar processing time: <60 seconds
- 3D viewer load time: <3 seconds
- DXF export accuracy: 95%+ fit success rate
- API uptime: 99.5%

### Business KPIs
- Reduce returns due to fit issues: 50% reduction
- Increase custom order conversion: 30% lift
- Decrease production time: 20% faster (automated DXF generation)
- Customer satisfaction (fit): 4.5/5 stars

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Contact Style3D** to answer API questions
3. **Set up development environment** with mock data
4. **Build Phase 1** (foundation + API client)
5. **Iterate** based on Style3D API responses

---

**Ready to begin implementation once Style3D API details confirmed.**
