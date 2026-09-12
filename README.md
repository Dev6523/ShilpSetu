# ShilpSetu — AI-Driven Market Linkage & Smart Cataloging

A mobile-first Smart India Hackathon prototype for marginalized artisans and weavers.

## Included prototype modules

1. Artisan Dashboard
2. AI Photo Studio
   - Image upload
   - Brightness/contrast enhancement
   - AI enhancement simulation
   - Save product
3. Voice Auto-Cataloger
   - Hindi, Bengali, Tamil, Marathi, Telugu and English UI
   - Browser Speech Recognition when supported
   - AI listing generation simulation
4. Dynamic Pricing Assistant
   - Category + material + raw-cost based recommendation
   - Competitive range and confidence score
5. Product Catalog
   - LocalStorage persistence
6. B2B Marketplace
   - Government/B2B buyer prototype cards
7. Impact Dashboard
   - Demo impact KPIs and chart

## Run in VS Code

### Option A — easiest
Open the folder in VS Code and install the **Live Server** extension.

Right-click `index.html` → **Open with Live Server**.

### Option B — Python server
Open the VS Code terminal:

```bash
cd ShilpSetu_Prototype
python -m http.server 5500
```

Then open:

http://localhost:5500

## Recommended production architecture

Frontend:
- React Native / Flutter for Android + iOS
- Or convert this prototype to React + Vite

Backend:
- FastAPI or Node.js/Express
- PostgreSQL
- Object storage for images
- Redis for caching

AI services:
- Vision model for image quality/background segmentation
- Speech-to-text for regional languages
- LLM for multilingual catalog generation
- ML pricing model using marketplace trends, material cost, seasonality and demand

Integrations:
- ONDC
- GeM where eligible
- State government marketplaces
- Verified B2B buyer APIs
- Payment gateway
- SMS/WhatsApp notifications

## Important
This is a functional front-end prototype. AI enhancement, market-price data, buyer verification and marketplace integrations are simulated locally so the prototype can run without API keys.
