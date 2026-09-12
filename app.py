# Optional FastAPI starter for the production version.
# Install: pip install fastapi uvicorn python-multipart
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

app = FastAPI(title="ShilpSetu API")

class PricingRequest(BaseModel):
    product_name: str
    category: str
    material: str
    raw_material_cost: float
    description: str = ""

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ShilpSetu"}

@app.post("/api/pricing")
def pricing(req: PricingRequest):
    multipliers = {
        "Textile": 2.25, "Pottery": 2.0, "Woodcraft": 2.35,
        "Jewellery": 2.7, "Bamboo Craft": 2.1, "Painting": 2.55
    }
    material_adj = {
        "Silk": 1.12, "Cotton": .98, "Clay": .94,
        "Wood": 1.03, "Metal": 1.15, "Bamboo": .96
    }
    value = req.raw_material_cost * multipliers.get(req.category, 2.2) * material_adj.get(req.material, 1)
    return {
        "recommended_price": round(value / 50) * 50,
        "confidence": 0.82,
        "note": "Replace this rule-based demo with a trained pricing model and live market data."
    }

@app.post("/api/catalog/image")
async def catalog_image(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "message": "Connect a vision model here for background removal, lighting correction and product attribute extraction."
    }

@app.post("/api/catalog/voice")
def catalog_voice(text: str, language: str = "Hindi"):
    return {
        "language": language,
        "title": "Handcrafted Artisan Product",
        "description": f"AI-generated listing based on: {text}"
    }
