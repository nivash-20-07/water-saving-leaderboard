from fastapi import APIRouter, Query
from typing import Optional
from backend.services.excel_service import excel_service
import pandas as pd

router = APIRouter()

@router.get("/reports")
def get_reports(month: Optional[str] = None, category: Optional[str] = None, location: Optional[str] = None):
    df = excel_service.get_filtered_data(month, category, location)
    if df.empty:
        return {
            "summary": {
                "totalWaterUsage": 0, "totalWaterSaved": 0, "averageSavings": 0, 
                "averageEfficiency": 0, "monitoredLocations": 0, "averageUsagePerUser": 0
            },
            "monthlyPerformance": [],
            "locationPerformance": [],
            "topPerformers": [],
            "attentionRequired": [],
            "insights": []
        }
        
    # 1. Summary
    total_water_usage = int(df['Water Used (Litres)'].sum())
    total_water_saved = int(df['Water Saved (Litres)'].sum())
    avg_savings = round(df['Savings (%)'].mean(), 1)
    avg_efficiency = round(df['Efficiency Score'].mean(), 1)
    monitored_locations = df['Location'].nunique()
    
    total_users = df['Students / Users'].sum()
    avg_usage_per_user = round(total_water_usage / total_users, 1) if total_users > 0 else 0

    summary = {
        "totalWaterUsage": total_water_usage,
        "totalWaterSaved": total_water_saved,
        "averageSavings": avg_savings,
        "averageEfficiency": avg_efficiency,
        "monitoredLocations": monitored_locations,
        "averageUsagePerUser": avg_usage_per_user
    }

    # 2. Monthly Performance
    monthly_grouped = df.groupby('Month Number').agg({
        'Month': 'first',
        'Water Used (Litres)': 'sum',
        'Water Saved (Litres)': 'sum',
        'Savings (%)': 'mean',
        'Efficiency Score': 'mean'
    }).reset_index().sort_values('Month Number')
    
    monthly_grouped['Savings (%)'] = monthly_grouped['Savings (%)'].round(1)
    monthly_grouped['Efficiency Score'] = monthly_grouped['Efficiency Score'].round(1)
    
    monthly_performance = monthly_grouped[['Month', 'Water Used (Litres)', 'Water Saved (Litres)', 'Savings (%)', 'Efficiency Score']].to_dict(orient='records')

    # 3. Location Performance
    location_grouped = df.groupby('Location').agg({
        'Category': 'first',
        'Water Used (Litres)': 'sum',
        'Water Saved (Litres)': 'sum',
        'Savings (%)': 'mean',
        'Efficiency Score': 'mean',
        'Leaderboard Points': 'sum'
    }).reset_index()
    
    location_grouped['Savings (%)'] = location_grouped['Savings (%)'].round(1)
    location_grouped['Efficiency Score'] = location_grouped['Efficiency Score'].round(1)
    
    location_grouped = location_grouped.sort_values(by='Leaderboard Points', ascending=False).reset_index(drop=True)
    location_grouped['Rank'] = location_grouped.index + 1
    
    location_performance = location_grouped[['Rank', 'Location', 'Category', 'Water Used (Litres)', 'Water Saved (Litres)', 'Savings (%)', 'Efficiency Score']].to_dict(orient='records')

    # 4. Top Performers (Top 5)
    top_performers = location_performance[:5]

    # 5. Attention Required
    # Logic: High consumption (> average) OR low savings (< 5%) OR low efficiency (< 75)
    avg_loc_consumption = location_grouped['Water Used (Litres)'].mean()
    
    attention_required = []
    for _, row in location_grouped.iterrows():
        issues = []
        if row['Water Used (Litres)'] > avg_loc_consumption * 1.5:
            issues.append({"issue": "High consumption pattern", "recommendation": "Investigate unusual water usage spikes."})
        if row['Savings (%)'] < 5:
            issues.append({"issue": "Low savings performance", "recommendation": "Implement targeted conservation campaigns."})
        if row['Efficiency Score'] < 75:
            issues.append({"issue": "Low efficiency score", "recommendation": "Efficiency improvement recommended. Review hardware."})
            
        if issues:
            attention_required.append({
                "location": row['Location'],
                "category": row['Category'],
                "waterUsage": row['Water Used (Litres)'],
                "savings": row['Savings (%)'],
                "issues": issues
            })

    # 6. Insights
    insights = []
    
    if len(monthly_performance) > 1:
        last_month = monthly_performance[-1]
        prev_month = monthly_performance[-2]
        if last_month['Water Used (Litres)'] < prev_month['Water Used (Litres)']:
            insights.append(f"Water consumption decreased in {last_month['Month']} compared to {prev_month['Month']}.")
        else:
            insights.append(f"Water consumption increased in {last_month['Month']} compared to {prev_month['Month']}.")
            
    if top_performers:
        best = top_performers[0]
        insights.append(f"{best['Location']} achieved the highest overall performance with an efficiency score of {best['Efficiency Score']}/100.")
        
    cat_grouped = df.groupby('Category')['Water Used (Litres)'].sum()
    if not cat_grouped.empty:
        top_cat = cat_grouped.idxmax()
        insights.append(f"{top_cat} account for the majority of water consumption in the selected period.")
        
    if attention_required:
        insights.append(f"{len(attention_required)} location(s) require attention due to low efficiency or high usage.")
    else:
        insights.append("All monitored locations are performing within acceptable efficiency ranges.")

    return {
        "summary": summary,
        "monthlyPerformance": monthly_performance,
        "locationPerformance": location_performance,
        "topPerformers": top_performers,
        "attentionRequired": attention_required,
        "insights": insights
    }
