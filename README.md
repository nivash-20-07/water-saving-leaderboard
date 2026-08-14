# 💧 AquaSave – Campus Water Intelligence

## 📌 Project Overview

AquaSave – Campus Water Intelligence is a web-based campus water management system designed to monitor, analyze, and compare water consumption across college hostels and academic blocks.

The system provides a centralized dashboard where administrators can monitor water usage, track water savings, compare locations, view rankings, analyze performance, receive insights, and generate reports.

---

## 🎯 Problem Statement

Large educational campuses consume significant amounts of water across hostels, academic buildings, laboratories, and other facilities.

Without a centralized system to monitor and compare water consumption, it is difficult to:

- Identify high water-consuming locations
- Track water savings
- Compare hostel and department performance
- Encourage water conservation
- Analyze monthly consumption patterns
- Generate performance reports

---

## 💡 Proposed Solution

AquaSave provides a centralized platform for campus water management.

The system collects water usage data and converts it into meaningful information through dashboards, analytics, rankings, alerts, and reports.

The platform helps administrators understand where water is being consumed, which locations are saving more water, and which locations may require attention.

---

## ✨ Key Features

### 📊 Dashboard

Provides an overall view of campus water performance, including:

- Total water usage
- Total water saved
- Efficiency score
- Monitored locations
- Water consumption trends
- Campus performance overview

### 💧 Water Usage

Provides detailed water consumption information for:

- Hostels
- College blocks
- Monthly usage
- Water saved
- Savings percentage
- Usage per user
- Efficiency score

### 🏆 Water Savings Leaderboard

Ranks hostels and college blocks according to their water-saving performance.

The leaderboard considers factors such as:

- Water saved
- Savings percentage
- Efficiency score
- Leaderboard points

### 📈 Analytics

Provides visual analysis of campus water data through:

- Water consumption trends
- Water savings trends
- Location comparison
- Hostel vs college block comparison
- Efficiency analysis
- Savings percentage analysis

### 🔔 Alerts & Insights

Provides data-based insights for locations that require attention.

The system can identify patterns such as:

- High water consumption
- Low savings performance
- Low efficiency
- Positive water-saving performance

### 📄 Reports

Provides summarized water-performance reports including:

- Monthly performance
- Location performance
- Top-performing locations
- Locations requiring attention
- Key insights
- Report export options

### ⚙️ Settings

Provides administrative configuration options such as:

- Notification preferences
- Water monitoring settings
- Alert thresholds
- Application preferences
- System/API status

---

## 🏫 Monitored Campus Locations

### Hostels

1. Ruby Hostel
2. Emerald Hostel
3. Sapphire Hostel
4. Diamond Hostel
5. Pearl Hostel

### College Blocks

1. AS Block
2. IB Block
3. Learning Center
4. Mechanical Block
5. Sunflower Block
6. Research Block

---

## 📊 Prototype Dataset

The prototype uses six months of sample campus water-usage data.

The dataset contains:

- Month
- Category
- Location
- Students / Users
- Water Used
- Previous Month Usage
- Water Saved
- Savings Percentage
- Usage Per User
- Efficiency Score
- Leaderboard Points
- Monthly Rank

The prototype dataset can later be replaced with real campus water-meter data.

---

## 🏗️ System Architecture

```text
                AquaSave
                   │
                   ▼
            React Frontend
                   │
                   ▼
             FastAPI Backend
                   │
                   ▼
             Python + Pandas
                   │
                   ▼
          Campus Water Data
                   │
          ┌────────┴────────┐
          ▼                 ▼
      Analytics         Calculations
          │                 │
          └────────┬────────┘
                   ▼
       ┌────────────────────────┐
       │ Dashboard              │
       │ Water Usage            │
       │ Leaderboard            │
       │ Analytics              │
       │ Alerts & Insights      │
       │ Reports                │
       └────────────────────────┘
