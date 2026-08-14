import pandas as pd
import os
import math

class ExcelService:
    def __init__(self):
        # Allow running from root or backend dir
        file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'AquaSave_PowerBI_6_Month_Fake_Data.xlsx')
        if not os.path.exists(file_path):
            # Try from root
            file_path = os.path.join('backend', 'data', 'AquaSave_PowerBI_6_Month_Fake_Data.xlsx')
            
        self.file_path = file_path
        self._df = None
        
    def get_data(self):
        if self._df is None:
            self.reload_data()
        return self._df
        
    def reload_data(self):
        df = pd.read_excel(self.file_path, sheet_name='Water Data')
        # Handle nan values to avoid JSON serialization errors
        df = df.replace({float('nan'): None})
        self._df = df
        
    def get_filtered_data(self, month=None, category=None, location=None):
        df = self.get_data()
        
        if month and month != 'All Months' and month != 'All':
            # Extract month name if format is 'March 2026'
            month_name = month.split(' ')[0] if ' ' in month else month
            df = df[df['Month'] == month_name]
            
        if category and category != 'All' and category != 'All Categories':
            df = df[df['Category'] == category]
            
        if location and location != 'All Locations' and location != 'All':
            df = df[df['Location'] == location]
            
        return df

excel_service = ExcelService()
