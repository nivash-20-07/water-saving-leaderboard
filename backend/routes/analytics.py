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
        return {
            "kpis": {"totalWaterUsage": 0, "waterSaved": 0, "averageSavings": 0, "efficiencyScore": 0},
            "monthlyTrend": [], "waterSavingsTrend": [], "locationComparison": [], 
            "categoryComparison": [], "efficiencyByLocation": [], "savingsByLocation": [], 
            "topPerformers": [], "insights": []
        }
        
    # KPIs
    kpis = {
        "totalWaterUsage": int(df['Water Used (Litres)'].sum()),
        "waterSaved": int(df['Water Saved (Litres)'].sum()),
        "averageSavings": round(df['Savings (%)'].mean(), 1) if not df.empty else 0,
        "efficiencyScore": round(df['Efficiency Score'].mean(), 1) if not df.empty else 0
    }
    
    # 1. Monthly Water Consumption & Savings Trend (use all data to show full 6 months, filtered by location/cat if needed)
    trend_df = all_df.copy()
    if category and category != 'All' and category != 'All Categories':
        trend_df = trend_df[trend_df['Category'] == category]
    if location and location != 'All Locations' and location != 'All':
        trend_df = trend_df[trend_df['Location'] == location]
        
    trend_grouped = trend_df.groupby('Month Number').agg({'Water Used (Litres)': 'sum', 'Water Saved (Litres)': 'sum', 'Month': 'first'}).reset_index().sort_values('Month Number')
    monthly_trend = trend_grouped[['Month', 'Water Used (Litres)']].to_dict(orient='records')
    water_savings_trend = trend_grouped[['Month', 'Water Saved (Litres)']].to_dict(orient='records')
    
    # 3. Location Comparison
    loc_comp = df.groupby('Location')['Water Used (Litres)'].sum().reset_index().sort_values('Water Used (Litres)', ascending=False)
    location_comparison = loc_comp.to_dict(orient='records')
    
    # 4. Hostel vs Block (Category Comparison)
    cat_comp = df.groupby('Category')['Water Used (Litres)'].sum().reset_index()
    category_comparison = cat_comp.to_dict(orient='records')
    
    # 5. Efficiency by Location
    eff_comp = df.groupby('Location')['Efficiency Score'].mean().reset_index().sort_values('Efficiency Score', ascending=False)
    eff_comp['Efficiency Score'] = eff_comp['Efficiency Score'].round(1)
    efficiency_by_location = eff_comp.to_dict(orient='records')
    
    # 6. Savings % by Location
    sav_comp = df.groupby('Location')['Savings (%)'].mean().reset_index().sort_values('Savings (%)', ascending=False)
    sav_comp['Savings (%)'] = sav_comp['Savings (%)'].round(1)
    savings_by_location = sav_comp.to_dict(orient='records')
    
    # Top Performers
    top_df = df.groupby('Location').agg({'Water Saved (Litres)': 'sum', 'Savings (%)': 'mean', 'Efficiency Score': 'mean', 'Leaderboard Points': 'sum'}).reset_index()
    top_df = top_df.sort_values(by=['Leaderboard Points', 'Savings (%)'], ascending=[False, False]).head(5)
    top_df['Savings (%)'] = top_df['Savings (%)'].round(1)
    top_df['Efficiency Score'] = top_df['Efficiency Score'].round(1)
    top_performers = top_df.to_dict(orient='records')
    
    # Insights
    insights = []
    if len(top_performers) > 0:
        top_loc = top_performers[0]['Location']
        insights.append(f"{top_loc} achieved the highest water savings this period.")
        
    if kpis['waterSaved'] > 0:
        insights.append(f"Water consumption decreased overall, saving {kpis['waterSaved']:,} litres.")
    else:
        insights.append("Water consumption increased overall during this period.")
        
    if len(efficiency_by_location) > 0:
        top_eff = efficiency_by_location[0]['Location']
        insights.append(f"{top_eff} has one of the strongest efficiency scores.")
        
    hostel_total = df[df['Category'] == 'Hostels']['Water Used (Litres)'].sum()
    block_total = df[df['Category'] == 'College Blocks']['Water Used (Litres)'].sum()
    
    if hostel_total > block_total:
        insights.append("Hostels account for the majority of campus water consumption.")
    elif block_total > hostel_total:
        insights.append("College Blocks account for the majority of campus water consumption.")

    return {
        "kpis": kpis,
        "monthlyTrend": monthly_trend,
        "waterSavingsTrend": water_savings_trend,
        "locationComparison": location_comparison,
        "categoryComparison": category_comparison,
        "efficiencyByLocation": efficiency_by_location,
        "savingsByLocation": savings_by_location,
        "topPerformers": top_performers,
        "insights": insights
    }
