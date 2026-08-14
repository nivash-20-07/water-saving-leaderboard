
from fastapi import APIRouter, Query
from typing import Optional
from backend.services.excel_service import excel_service
import pandas as pd

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(month: Optional[str] = None):
    df = excel_service.get_filtered_data(month=month)
    
    if df.empty:
        return {}
        
    total_usage = df['Water Used (Litres)'].sum()
    total_saved = df['Water Saved (Litres)'].sum()
    
    prev_usage = df['Previous Month Usage (Litres)'].sum()
    avg_savings = round((total_saved / prev_usage * 100), 1) if prev_usage > 0 else 0
    
    avg_efficiency = round(df['Efficiency Score'].mean(), 1)
    monitored_locations = df['Location'].nunique()
    
    hostel_usage = df[df['Category'] == 'Hostels']['Water Used (Litres)'].sum()
    block_usage = df[df['Category'] == 'College Blocks']['Water Used (Litres)'].sum()
    
    # Top performers
    top_df = df.sort_values(by=['Leaderboard Points', 'Savings (%)'], ascending=[False, False]).head(5)
    top_performers = top_df[['Location', 'Savings (%)', 'Efficiency Score', 'Category']].to_dict(orient='records')
    
    # Monthly trend (get all data for this)
    all_df = excel_service.get_data()
    trend_df = all_df.groupby('Month Number').agg({'Water Used (Litres)': 'sum', 'Month': 'first'}).reset_index().sort_values('Month Number')
    monthly_trend = trend_df[['Month', 'Water Used (Litres)']].to_dict(orient='records')
    
    # Simple alerts based on the current filtered data
    alerts = []
    for _, row in df.iterrows():
        if row['Savings (%)'] > 10:
            alerts.append({"type": "Positive", "location": row['Location'], "message": f"{row['Location']} achieved strong water savings this month."})
        elif row['Savings (%)'] < -10:
            alerts.append({"type": "Warning", "location": row['Location'], "message": f"{row['Location']} recorded higher consumption compared with its previous month."})
    
    return {
        "totalWaterUsage": int(total_usage),
        "totalWaterSaved": int(total_saved),
        "averageSavings": avg_savings,
        "efficiencyScore": avg_efficiency,
        "monitoredLocations": monitored_locations,
        "hostelUsage": int(hostel_usage),
        "collegeBlockUsage": int(block_usage),
        "topPerformers": top_performers,
        "monthlyTrend": monthly_trend,
        "alerts": alerts[:3] # Return top 3 alerts
    }
