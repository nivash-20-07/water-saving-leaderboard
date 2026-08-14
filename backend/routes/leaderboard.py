
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
