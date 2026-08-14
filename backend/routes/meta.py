
from fastapi import APIRouter
from backend.services.excel_service import excel_service

router = APIRouter()

@router.get("/locations")
def get_locations():
    df = excel_service.get_data()
    return sorted(df['Location'].unique().tolist())
    
@router.get("/months")
def get_months():
    df = excel_service.get_data()
    # Sort by month number
    sorted_months = df.sort_values('Month Number')['Month'].unique().tolist()
    return sorted_months
