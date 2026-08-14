
from fastapi import APIRouter, Query
from typing import Optional
from backend.services.excel_service import excel_service

router = APIRouter()

@router.get("/water-usage")
def get_water_usage(month: Optional[str] = None, category: Optional[str] = None, location: Optional[str] = None):
    df = excel_service.get_filtered_data(month, category, location)
    
    if df.empty:
        return {"data": [], "summary": {}}
        
    summary = {
        "totalWaterUsed": int(df['Water Used (Litres)'].sum()),
        "waterSaved": int(df['Water Saved (Litres)'].sum()),
        "avgUsagePerUser": round(df['Usage per User (L/month)'].mean(), 1)
    }
    
    # Return raw data for table
    data = df.to_dict(orient='records')
    
    return {"data": data, "summary": summary}
