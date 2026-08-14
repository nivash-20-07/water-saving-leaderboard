
from fastapi import APIRouter, Query
from typing import Optional
from backend.services.excel_service import excel_service

router = APIRouter()

@router.get("/alerts")
def get_alerts(month: Optional[str] = None):
    df = excel_service.get_filtered_data(month)
    alerts = []
    
    for _, row in df.iterrows():
        if row['Savings (%)'] > 10:
            alerts.append({"type": "Positive", "location": row['Location'], "month": row['Month'], "message": f"{row['Location']} achieved strong water savings this month.", "severity": "Positive"})
        elif row['Savings (%)'] < -10:
            alerts.append({"type": "Warning", "location": row['Location'], "month": row['Month'], "message": f"{row['Location']} recorded higher consumption compared with its previous month.", "severity": "Warning"})
        elif row['Usage per User (L/month)'] > 400 and row['Category'] == 'Hostels':
            alerts.append({"type": "High Consumption", "location": row['Location'], "month": row['Month'], "message": f"{row['Location']} has very high usage per student.", "severity": "Warning"})
            
    return alerts
