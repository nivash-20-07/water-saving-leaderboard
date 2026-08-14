import os

routes_dir = r"C:\Users\NIVASH N\OneDrive\Documents\WATER SAVING\backend\routes"

dashboard_code = """
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
"""

water_usage_code = """
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
"""

leaderboard_code = """
from fastapi import APIRouter, Query
from typing import Optional
from backend.services.excel_service import excel_service

router = APIRouter()

@router.get("/leaderboard")
def get_leaderboard(month: Optional[str] = None, category: Optional[str] = None):
    df = excel_service.get_filtered_data(month, category)
    
    if df.empty:
        return []
        
    # If looking at all months, group by location and average the scores
    if month is None or month == 'All Months' or month == 'All':
        grouped = df.groupby(['Location', 'Category']).agg({
            'Water Saved (Litres)': 'sum',
            'Savings (%)': 'mean',
            'Efficiency Score': 'mean',
            'Leaderboard Points': 'sum'
        }).reset_index()
        df = grouped
    
    # Sort by Points DESC, then Savings % DESC
    df = df.sort_values(by=['Leaderboard Points', 'Savings (%)'], ascending=[False, False])
    
    # Add rank
    df['Rank'] = range(1, len(df) + 1)
    
    # Round floats for JSON
    df['Savings (%)'] = df['Savings (%)'].round(1)
    df['Efficiency Score'] = df['Efficiency Score'].round(1)
    
    return df.to_dict(orient='records')
"""

analytics_code = """
from fastapi import APIRouter, Query
from typing import Optional
from backend.services.excel_service import excel_service

router = APIRouter()

@router.get("/analytics")
def get_analytics(month: Optional[str] = None, category: Optional[str] = None, location: Optional[str] = None):
    # Base analytics from all data or filtered
    df = excel_service.get_filtered_data(month, category, location)
    all_df = excel_service.get_data()
    
    if df.empty:
        return {}
        
    # Monthly Water Consumption Chart (use all data if filtering by location/cat, else just show trend)
    trend_df = all_df.copy()
    if category and category != 'All':
        trend_df = trend_df[trend_df['Category'] == category]
    if location and location != 'All Locations':
        trend_df = trend_df[trend_df['Location'] == location]
        
    monthly_trend = trend_df.groupby('Month Number').agg({'Water Used (Litres)': 'sum', 'Water Saved (Litres)': 'sum', 'Month': 'first'}).reset_index().sort_values('Month Number')
    
    # Hostel vs Block Comparison (current filter)
    cat_comp = df.groupby('Category')['Water Used (Litres)'].sum().to_dict()
    
    return {
        "monthlyTrend": monthly_trend[['Month', 'Water Used (Litres)', 'Water Saved (Litres)']].to_dict(orient='records'),
        "categoryComparison": cat_comp
    }
"""

alerts_code = """
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
"""

reports_code = """
from fastapi import APIRouter, Query
from typing import Optional
from backend.services.excel_service import excel_service

router = APIRouter()

@router.get("/reports")
def get_reports(month: Optional[str] = None, category: Optional[str] = None):
    df = excel_service.get_filtered_data(month, category)
    if df.empty: return {}
    
    return {
        "summary": "Report data ready for download.",
        "totalRecords": len(df)
    }
"""

meta_code = """
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
"""

files = {
    "dashboard.py": dashboard_code,
    "water_usage.py": water_usage_code,
    "leaderboard.py": leaderboard_code,
    "analytics.py": analytics_code,
    "alerts.py": alerts_code,
    "reports.py": reports_code,
    "meta.py": meta_code
}

for filename, content in files.items():
    with open(os.path.join(routes_dir, filename), "w") as f:
        f.write(content)
        
print("Routes created.")
