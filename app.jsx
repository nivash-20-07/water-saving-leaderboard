// app.jsx
const { useState, useEffect } = React;

const API_BASE = "http://localhost:8000/api";

// --- Reusable Components ---

const Sidebar = ({ isMobileOpen, setMobileOpen, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', icon: 'ph-squares-four', label: 'Dashboard' },
    { id: 'water-usage', icon: 'ph-drop', label: 'Water Usage' },
    { id: 'leaderboard', icon: 'ph-trophy', label: 'Leaderboard' },
    { id: 'analytics', icon: 'ph-chart-line-up', label: 'Analytics' },
    { id: 'alerts', icon: 'ph-bell-ringing', label: 'Alerts & Insights' },
    { id: 'reports', icon: 'ph-file-text', label: 'Reports' },
    { id: 'settings', icon: 'ph-gear', label: 'Settings' }
  ];

  return (
    <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <i className="ph-fill ph-drop"></i>
        <span>Campus Water Intel</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <a 
            key={item.id} 
            href={`#${item.id}`} 
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab(item.id); setMobileOpen(false); }}
          >
            <i className={`ph ${item.icon}`}></i> {item.label}
          </a>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="admin-profile">
          <div className="admin-avatar">A</div>
          <div className="admin-info">
            <span className="admin-name">Admin</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>
        <button className="logout-btn" onClick={() => window.location.href='index.html'}>
          <i className="ph ph-sign-out"></i> Logout
        </button>
      </div>
    </aside>
  );
};

const Header = ({ setMobileOpen, title, subtitle }) => (
  <header className="top-header">
    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
      <button className="menu-toggle" onClick={() => setMobileOpen(prev => !prev)}>
        <i className="ph ph-list"></i>
      </button>
      <div className="header-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
    <div className="header-actions">
      <button className="icon-button"><i className="ph ph-magnifying-glass"></i></button>
      <button className="icon-button">
        <i className="ph ph-bell"></i>
        <span className="notification-dot"></span>
      </button>
      <div className="header-avatar">A</div>
    </div>
  </header>
);

const StatCard = ({ title, value, iconClass, icon, trend, desc }) => {
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const trendClass = isPositive ? 'trend-positive' : isNegative ? 'trend-negative' : 'trend-neutral';
  const trendIcon = isPositive ? 'ph-arrow-up-right' : isNegative ? 'ph-arrow-down-right' : 'ph-minus';
  
  return (
    <div className="stat-card">
      <div className="stat-header">
        <h4 className="stat-title">{title}</h4>
        <div className={`stat-icon ${iconClass}`}><i className={`ph ${icon}`}></i></div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-trend">
        {trend !== undefined && trend !== 0 && <span className={trendClass}><i className={`ph ${trendIcon}`}></i> {Math.abs(trend)}%</span>}
        <span className="stat-desc">{desc}</span>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div style={{padding: '4rem', textAlign: 'center', color: '#64748b'}}>
    <i className="ph ph-spinner ph-spin" style={{fontSize: '2rem', marginBottom: '1rem'}}></i>
    <p>Loading campus water data...</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div style={{padding: '4rem', textAlign: 'center', color: '#ef4444'}}>
    <i className="ph-fill ph-warning-circle" style={{fontSize: '3rem', marginBottom: '1rem'}}></i>
    <p>{message || "Unable to load water data. Please check the backend connection."}</p>
  </div>
);

const EmptyState = () => (
  <div style={{padding: '4rem', textAlign: 'center', color: '#64748b'}}>
    <i className="ph ph-empty" style={{fontSize: '3rem', marginBottom: '1rem'}}></i>
    <p>No water usage data available for the selected filters.</p>
  </div>
);

const FilterBar = ({ months, locations, filter, setFilter }) => (
  <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
    <select className="captcha-input" style={{width: 'auto', padding: '0.5rem 1rem'}} 
            value={filter.month} onChange={e => setFilter({...filter, month: e.target.value})}>
      <option value="All Months">All Months</option>
      {months.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
    
    {filter.category !== undefined && (
      <select className="captcha-input" style={{width: 'auto', padding: '0.5rem 1rem'}}
              value={filter.category} onChange={e => setFilter({...filter, category: e.target.value, location: 'All Locations'})}>
        <option value="All Categories">All Categories</option>
        <option value="Hostels">Hostels</option>
        <option value="College Blocks">College Blocks</option>
      </select>
    )}

    {filter.location !== undefined && (
      <select className="captcha-input" style={{width: 'auto', padding: '0.5rem 1rem'}}
              value={filter.location} onChange={e => setFilter({...filter, location: e.target.value})}>
        <option value="All Locations">All Locations</option>
        {locations.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
    )}
  </div>
);

// --- Pages ---

const DashboardView = ({ filter, setFilter, setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/dashboard?month=${filter.month}`)
      .then(res => { if(!res.ok) throw new Error(); return res.json(); })
      .then(d => { setData(d); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filter.month]);

  useEffect(() => {
    if (data && data.monthlyTrend) {
      const ctx = document.getElementById('waterChart');
      if (ctx) {
        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();
        
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.monthlyTrend.map(d => d.Month),
            datasets: [{
              label: 'Water Used (L)',
              data: data.monthlyTrend.map(d => d['Water Used (Litres)']),
              borderColor: '#0ea5e9',
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
          }
        });
      }

      const ctxCat = document.getElementById('categoryChart');
      if (ctxCat && data.hostelUsage && data.collegeBlockUsage) {
        const existingCatChart = Chart.getChart(ctxCat);
        if (existingCatChart) existingCatChart.destroy();

        new Chart(ctxCat, {
          type: 'doughnut',
          data: {
            labels: ['Hostels', 'College Blocks'],
            datasets: [{
              data: [data.hostelUsage, data.collegeBlockUsage],
              backgroundColor: ['#0ea5e9', '#10b981'],
              borderWidth: 0
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '70%' }
        });
      }
    }
  }, [data]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!data || Object.keys(data).length === 0) return <EmptyState />;

  return (
    <div className="dashboard-body">
      <div className="welcome-section">
        <h2>Good Morning, Admin 👋</h2>
        <p>Monitor campus water consumption, track savings, and identify opportunities to reduce wastage.</p>
      </div>

      <div className="cards-grid">
        <StatCard title="Total Water Usage" value={`${data.totalWaterUsage.toLocaleString()} L`} iconClass="icon-blue" icon="ph-waves" trend={0} desc="Total in selected period" />
        <StatCard title="Water Saved" value={`${data.totalWaterSaved.toLocaleString()} L`} iconClass="icon-green" icon="ph-leaf" trend={data.averageSavings} desc="Avg savings %" />
        <StatCard title="Avg Efficiency Score" value={`${data.efficiencyScore} / 100`} iconClass="icon-purple" icon="ph-gauge" desc="Campus Performance" />
        <StatCard title="Monitored Locations" value={data.monitoredLocations} iconClass="icon-orange" icon="ph-map-pin" desc="Hostels & Blocks" />
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <h3>Water Consumption Trend</h3>
              <p>Campus-wide consumption over time</p>
            </div>
          </div>
          <div className="chart-container"><canvas id="waterChart"></canvas></div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <h3>Water Usage by Category</h3>
            </div>
          </div>
          <div className="chart-container" style={{height: '220px'}}><canvas id="categoryChart"></canvas></div>
          <div style={{marginTop: '1.5rem'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
              <span style={{fontWeight:600, fontSize:'0.875rem'}}>HOSTELS</span>
              <span style={{fontWeight:700, fontSize:'0.875rem'}}>{data.hostelUsage.toLocaleString()} L</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
              <span style={{fontWeight:600, fontSize:'0.875rem'}}>COLLEGE BLOCKS</span>
              <span style={{fontWeight:700, fontSize:'0.875rem'}}>{data.collegeBlockUsage.toLocaleString()} L</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title"><h3>Top Water Savers</h3></div>
          </div>
          <div className="leaderboard-list">
            {data.topPerformers.map((item, idx) => (
              <div className="leaderboard-item" key={idx}>
                <div className={`rank-badge rank-${idx+1 > 3 ? 'other' : idx+1}`}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx+1}</div>
                <div className="lb-info">
                  <div className="lb-name">{item.Location}</div>
                  <div className="lb-saved">{item['Savings (%)']}% Saved</div>
                </div>
                <div className="lb-score">
                  <div className="score-val">{item['Efficiency Score']}</div>
                  <div className="score-label">Score</div>
                </div>
              </div>
            ))}
          </div>
          <button className="view-all-btn" onClick={() => setActiveTab('leaderboard')}>
            View Full Leaderboard <i className="ph ph-arrow-right"></i>
          </button>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="card" style={{padding: '1.5rem'}}>
            <div className="card-title" style={{marginBottom: '1rem'}}>
              <h3>Smart Alerts & Insights</h3>
            </div>
            <div className="alerts-list">
              {data.alerts.map((alert, idx) => (
                <div key={idx} className={`alert-card ${alert.type === 'Warning' ? 'alert-warning' : alert.type === 'Positive' ? 'alert-success' : 'alert-danger'}`}>
                  <i className={`ph-fill ${alert.type === 'Warning' ? 'ph-trend-up' : alert.type === 'Positive' ? 'ph-check-circle' : 'ph-warning'} alert-icon`}></i>
                  <div className="alert-content">
                    <h4>{alert.type}</h4>
                    <p>{alert.message}</p>
                  </div>
                </div>
              ))}
              {data.alerts.length === 0 && <p style={{fontSize: '0.875rem', color: '#64748b'}}>No critical alerts for this period.</p>}
            </div>
          </div>
          <div className="card">
            <div className="card-title">
              <h3>Campus Sustainability Goal</h3>
            </div>
            <div className="goal-progress">
              <div className="progress-header">
                <span>Reduce campus water consumption by 20%</span>
                <span style={{color: '#0ea5e9'}}>14.2%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{width: `71%`}}></div>
              </div>
              <div className="goal-desc">
                <i className="ph-fill ph-drop"></i>
                <span>5.8% more reduction needed to reach the campus target.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WaterUsageView = ({ filter, setFilter, months, locations }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    let q = `month=${filter.month}`;
    if (filter.category !== 'All Categories') q += `&category=${filter.category}`;
    if (filter.location !== 'All Locations') q += `&location=${filter.location}`;
    
    fetch(`${API_BASE}/water-usage?${q}`)
      .then(res => { if(!res.ok) throw new Error(); return res.json(); })
      .then(d => { setData(d); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filter.month, filter.category, filter.location]);

  return (
    <div className="dashboard-body">
      <FilterBar months={months} locations={locations} filter={filter} setFilter={setFilter} />
      
      {loading ? <LoadingState /> : error ? <ErrorState /> : data.data.length === 0 ? <EmptyState /> : (
        <>
          <div className="cards-grid" style={{marginBottom: '2rem'}}>
            <StatCard title="Total Water Used" value={`${data.summary.totalWaterUsed.toLocaleString()} L`} iconClass="icon-blue" icon="ph-waves" />
            <StatCard title="Water Saved" value={`${data.summary.waterSaved.toLocaleString()} L`} iconClass="icon-green" icon="ph-leaf" />
            <StatCard title="Avg Usage / User" value={`${data.summary.avgUsagePerUser} L`} iconClass="icon-purple" icon="ph-users" />
          </div>
          <div className="card" style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
              <thead>
                <tr style={{borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase'}}>
                  <th style={{padding: '1rem'}}>Month</th>
                  <th style={{padding: '1rem'}}>Category</th>
                  <th style={{padding: '1rem'}}>Location</th>
                  <th style={{padding: '1rem'}}>Users</th>
                  <th style={{padding: '1rem'}}>Water Used (L)</th>
                  <th style={{padding: '1rem'}}>Saved (L)</th>
                  <th style={{padding: '1rem'}}>Savings %</th>
                  <th style={{padding: '1rem'}}>Score</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((row, i) => (
                  <tr key={i} style={{borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem'}}>
                    <td style={{padding: '1rem'}}>{row.Month}</td>
                    <td style={{padding: '1rem'}}>{row.Category}</td>
                    <td style={{padding: '1rem', fontWeight: 600}}>{row.Location}</td>
                    <td style={{padding: '1rem'}}>{row['Students / Users']}</td>
                    <td style={{padding: '1rem'}}>{row['Water Used (Litres)'].toLocaleString()}</td>
                    <td style={{padding: '1rem', color: row['Water Saved (Litres)'] > 0 ? '#10b981' : '#ef4444'}}>{row['Water Saved (Litres)'].toLocaleString()}</td>
                    <td style={{padding: '1rem'}}>{row['Savings (%)']}%</td>
                    <td style={{padding: '1rem'}}>{row['Efficiency Score']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const LeaderboardView = ({ filter, setFilter, months }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    let q = `month=${filter.month}`;
    if (filter.category !== 'All Categories') q += `&category=${filter.category}`;
    
    fetch(`${API_BASE}/leaderboard?${q}`)
      .then(res => { if(!res.ok) throw new Error(); return res.json(); })
      .then(d => { setData(d); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filter.month, filter.category]);

  return (
    <div className="dashboard-body">
      <FilterBar months={months} locations={[]} filter={{...filter, location: undefined}} setFilter={setFilter} />
      
      {loading ? <LoadingState /> : error ? <ErrorState /> : data.length === 0 ? <EmptyState /> : (
        <div className="card" style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
            <thead>
              <tr style={{borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase'}}>
                <th style={{padding: '1rem'}}>Rank</th>
                <th style={{padding: '1rem'}}>Location</th>
                <th style={{padding: '1rem'}}>Category</th>
                <th style={{padding: '1rem'}}>Total Saved (L)</th>
                <th style={{padding: '1rem'}}>Savings %</th>
                <th style={{padding: '1rem'}}>Avg Score</th>
                <th style={{padding: '1rem'}}>Points</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem'}}>
                  <td style={{padding: '1rem'}}>
                    <div className={`rank-badge rank-${row.Rank > 3 ? 'other' : row.Rank}`}>{row.Rank === 1 ? '🥇' : row.Rank === 2 ? '🥈' : row.Rank === 3 ? '🥉' : row.Rank}</div>
                  </td>
                  <td style={{padding: '1rem', fontWeight: 600}}>{row.Location}</td>
                  <td style={{padding: '1rem'}}>{row.Category}</td>
                  <td style={{padding: '1rem', color: '#10b981'}}>{row['Water Saved (Litres)'].toLocaleString()}</td>
                  <td style={{padding: '1rem'}}>{row['Savings (%)']}%</td>
                  <td style={{padding: '1rem'}}>{row['Efficiency Score']}</td>
                  <td style={{padding: '1rem', fontWeight: 700}}>{row['Leaderboard Points']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AlertsView = ({ filter, setFilter, months }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/alerts?month=${filter.month}`)
      .then(res => { if(!res.ok) throw new Error(); return res.json(); })
      .then(d => { setData(d); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filter.month]);

  return (
    <div className="dashboard-body">
      <FilterBar months={months} locations={[]} filter={{...filter, category: undefined, location: undefined}} setFilter={setFilter} />
      
      {loading ? <LoadingState /> : error ? <ErrorState /> : data.length === 0 ? <EmptyState /> : (
        <div className="card" style={{padding: '2rem'}}>
          <div className="alerts-list">
            {data.map((alert, idx) => (
              <div key={idx} className={`alert-card ${alert.severity === 'Warning' ? 'alert-warning' : alert.severity === 'Positive' ? 'alert-success' : 'alert-danger'}`} style={{padding: '1.5rem'}}>
                <i className={`ph-fill ${alert.severity === 'Warning' ? 'ph-trend-up' : alert.severity === 'Positive' ? 'ph-check-circle' : 'ph-warning'} alert-icon`} style={{fontSize: '2rem'}}></i>
                <div className="alert-content">
                  <h4 style={{fontSize: '1.1rem'}}>{alert.type} - {alert.location} ({alert.month})</h4>
                  <p style={{fontSize: '1rem'}}>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const ReportsView = ({ months, locations }) => {
  const [localFilter, setLocalFilter] = useState({ month: 'All Months', category: 'All Categories', location: 'All Locations' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('aquasave_recent_reports');
    if (saved) setRecentReports(JSON.parse(saved));
  }, []);
  
  const generateReport = () => {
    setLoading(true);
    setError(false);
    
    let q = `month=${localFilter.month}`;
    if (localFilter.category !== 'All Categories' && localFilter.category !== 'All') q += `&category=${localFilter.category}`;
    if (localFilter.location !== 'All Locations') q += `&location=${localFilter.location}`;
    
    fetch(`${API_BASE}/reports?${q}`)
      .then(res => { if(!res.ok) throw new Error(); return res.json(); })
      .then(d => { 
        setData(d); 
        setError(false);
        
        // Save to recent
        const newReport = {
          name: `${localFilter.month} Campus Report`,
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          month: localFilter.month,
          category: localFilter.category,
          location: localFilter.location
        };
        const updatedRecent = [newReport, ...recentReports.filter(r => r.name !== newReport.name || r.category !== newReport.category || r.location !== newReport.location)].slice(0, 5);
        setRecentReports(updatedRecent);
        localStorage.setItem('aquasave_recent_reports', JSON.stringify(updatedRecent));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  
  const printReport = () => {
    window.print();
  };
  
  const downloadCSV = () => {
    if (!data) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Month,Location,Category,Water Used (Litres),Water Saved (Litres),Savings (%),Efficiency Score\n";
    
    data.locationPerformance.forEach(row => {
      csvContent += `${localFilter.month},${row.Location},${row.Category},${row['Water Used (Litres)']},${row['Water Saved (Litres)']},${row['Savings (%)']},${row['Efficiency Score']}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aquasave_report_${localFilter.month.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="dashboard-body">
      <div className="card" style={{padding: '2rem', marginBottom: '2rem'}}>
        <div className="card-title" style={{marginBottom: '1rem'}}>
          <h3>Generate Campus Report</h3>
        </div>
        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end'}}>
          <div>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600}}>MONTH</label>
            <select className="captcha-input" style={{padding: '0.5rem 1rem'}} value={localFilter.month} onChange={e => setLocalFilter({...localFilter, month: e.target.value})}>
              <option value="All Months">All Months</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600}}>CATEGORY</label>
            <select className="captcha-input" style={{padding: '0.5rem 1rem'}} value={localFilter.category} onChange={e => setLocalFilter({...localFilter, category: e.target.value, location: 'All Locations'})}>
              <option value="All Categories">All Categories</option>
              <option value="Hostels">Hostels</option>
              <option value="College Blocks">College Blocks</option>
            </select>
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600}}>LOCATION</label>
            <select className="captcha-input" style={{padding: '0.5rem 1rem'}} value={localFilter.location} onChange={e => setLocalFilter({...localFilter, location: e.target.value})}>
              <option value="All Locations">All Locations</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{padding: '0.5rem 2rem', height: '42px'}} onClick={generateReport} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
      
      {loading && (
        <div style={{padding: '4rem', textAlign: 'center', color: '#64748b'}}>
          <i className="ph ph-spinner ph-spin" style={{fontSize: '3rem', marginBottom: '1rem'}}></i>
          <p>Generating report...</p>
        </div>
      )}
      
      {error && !loading && (
        <div style={{padding: '4rem', textAlign: 'center', color: '#ef4444'}}>
          <i className="ph-fill ph-warning-circle" style={{fontSize: '3rem', marginBottom: '1rem'}}></i>
          <p>Unable to generate report.</p>
          <button className="btn btn-secondary" style={{marginTop: '1rem', width: 'auto'}} onClick={generateReport}>Retry</button>
        </div>
      )}
      
      {!loading && !error && data && data.locationPerformance.length === 0 && (
        <div style={{padding: '4rem', textAlign: 'center', color: '#64748b'}}>
          <i className="ph ph-empty" style={{fontSize: '3rem', marginBottom: '1rem'}}></i>
          <p>No report data available for the selected filters.</p>
        </div>
      )}
      
      {!loading && !error && data && data.locationPerformance.length > 0 && (
        <div id="report-content">
          <div className="cards-grid" style={{marginBottom: '2rem'}}>
            <StatCard title="Total Water Usage" value={`${data.summary.totalWaterUsage.toLocaleString()} L`} iconClass="icon-blue" icon="ph-waves" />
            <StatCard title="Water Saved" value={`${data.summary.totalWaterSaved.toLocaleString()} L`} iconClass="icon-green" icon="ph-leaf" />
            <StatCard title="Average Savings" value={`${data.summary.averageSavings}%`} iconClass="icon-orange" icon="ph-trend-down" />
            <StatCard title="Efficiency Score" value={`${data.summary.averageEfficiency} / 100`} iconClass="icon-purple" icon="ph-gauge" />
          </div>
          
          <div className="card" style={{padding: '2rem', marginBottom: '2rem'}}>
             <div className="card-title" style={{marginBottom: '1.5rem'}}>
               <h3>Campus Water Performance Summary</h3>
             </div>
             <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'}}>
               <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div className="stat-icon icon-blue"><i className="ph ph-map-pin"></i></div>
                  <div>
                    <div style={{fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase'}}>Monitored Locations</div>
                    <div style={{fontSize: '1.25rem', fontWeight: 700}}>{data.summary.monitoredLocations}</div>
                  </div>
               </div>
               <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div className="stat-icon icon-blue"><i className="ph ph-waves"></i></div>
                  <div>
                    <div style={{fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase'}}>Total Water Used</div>
                    <div style={{fontSize: '1.25rem', fontWeight: 700}}>{data.summary.totalWaterUsage.toLocaleString()} L</div>
                  </div>
               </div>
               <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div className="stat-icon icon-green"><i className="ph ph-leaf"></i></div>
                  <div>
                    <div style={{fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase'}}>Total Water Saved</div>
                    <div style={{fontSize: '1.25rem', fontWeight: 700}}>{data.summary.totalWaterSaved.toLocaleString()} L</div>
                  </div>
               </div>
               <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div className="stat-icon icon-purple"><i className="ph ph-users"></i></div>
                  <div>
                    <div style={{fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase'}}>Avg Usage / User</div>
                    <div style={{fontSize: '1.25rem', fontWeight: 700}}>{data.summary.averageUsagePerUser} L</div>
                  </div>
               </div>
               <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div className="stat-icon icon-orange"><i className="ph ph-trend-down"></i></div>
                  <div>
                    <div style={{fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase'}}>Average Savings</div>
                    <div style={{fontSize: '1.25rem', fontWeight: 700}}>{data.summary.averageSavings}%</div>
                  </div>
               </div>
               <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div className="stat-icon icon-purple"><i className="ph ph-gauge"></i></div>
                  <div>
                    <div style={{fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase'}}>Avg Efficiency Score</div>
                    <div style={{fontSize: '1.25rem', fontWeight: 700}}>{data.summary.averageEfficiency}</div>
                  </div>
               </div>
             </div>
          </div>
          
          <div className="card" style={{marginBottom: '2rem'}}>
            <div className="card-header"><div className="card-title"><h3>Monthly Water Performance</h3></div></div>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                <thead>
                  <tr style={{borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase'}}>
                    <th style={{padding: '1rem'}}>Month</th>
                    <th style={{padding: '1rem'}}>Water Used (L)</th>
                    <th style={{padding: '1rem'}}>Water Saved (L)</th>
                    <th style={{padding: '1rem'}}>Savings %</th>
                    <th style={{padding: '1rem'}}>Efficiency Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlyPerformance.map((row, i) => (
                    <tr key={i} style={{borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem'}}>
                      <td style={{padding: '1rem', fontWeight: 600}}>{row.Month}</td>
                      <td style={{padding: '1rem'}}>{row['Water Used (Litres)'].toLocaleString()}</td>
                      <td style={{padding: '1rem'}}>{row['Water Saved (Litres)'].toLocaleString()}</td>
                      <td style={{padding: '1rem'}}>
                        <span style={{color: row['Savings (%)'] >= 10 ? '#10b981' : row['Savings (%)'] < 5 ? '#ef4444' : 'inherit'}}>
                          {row['Savings (%)']}%
                          {row['Savings (%)'] >= 10 && <i className="ph ph-arrow-up" style={{marginLeft: '4px'}}></i>}
                          {row['Savings (%)'] < 5 && <i className="ph ph-arrow-down" style={{marginLeft: '4px'}}></i>}
                        </span>
                      </td>
                      <td style={{padding: '1rem'}}>{row['Efficiency Score']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="card" style={{marginBottom: '2rem'}}>
            <div className="card-header"><div className="card-title"><h3>Location Performance</h3></div></div>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                <thead>
                  <tr style={{borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase'}}>
                    <th style={{padding: '1rem'}}>Rank</th>
                    <th style={{padding: '1rem'}}>Location</th>
                    <th style={{padding: '1rem'}}>Category</th>
                    <th style={{padding: '1rem'}}>Water Used (L)</th>
                    <th style={{padding: '1rem'}}>Water Saved (L)</th>
                    <th style={{padding: '1rem'}}>Savings %</th>
                    <th style={{padding: '1rem'}}>Efficiency Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.locationPerformance.map((row, i) => (
                    <tr key={i} style={{borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem'}}>
                      <td style={{padding: '1rem'}}><div className={`rank-badge rank-${row.Rank > 3 ? 'other' : row.Rank}`}>{row.Rank}</div></td>
                      <td style={{padding: '1rem', fontWeight: 600}}>{row.Location}</td>
                      <td style={{padding: '1rem'}}>{row.Category}</td>
                      <td style={{padding: '1rem'}}>{row['Water Used (Litres)'].toLocaleString()}</td>
                      <td style={{padding: '1rem', color: '#10b981'}}>{row['Water Saved (Litres)'].toLocaleString()}</td>
                      <td style={{padding: '1rem'}}>{row['Savings (%)']}%</td>
                      <td style={{padding: '1rem'}}>{row['Efficiency Score']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bottom-grid" style={{gridTemplateColumns: '1fr 1fr', marginBottom: '2rem'}}>
            <div className="card">
              <div className="card-header"><div className="card-title"><h3>Top Water Saving Locations</h3></div></div>
              <div className="leaderboard-list">
                {data.topPerformers.map((item, idx) => (
                  <div className="leaderboard-item" key={idx}>
                    <div className={`rank-badge rank-${idx+1 > 3 ? 'other' : idx+1}`}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx+1}</div>
                    <div className="lb-info">
                      <div className="lb-name">{item.Location}</div>
                      <div className="lb-saved">{item['Water Saved (Litres)'].toLocaleString()} L Saved</div>
                    </div>
                    <div className="lb-score" style={{textAlign: 'right'}}>
                      <div className="score-val" style={{fontSize: '0.875rem'}}>{item['Savings (%)']}%</div>
                      <div className="score-label">Savings</div>
                    </div>
                    <div className="lb-score" style={{textAlign: 'right', marginLeft: '1rem'}}>
                      <div className="score-val" style={{fontSize: '0.875rem'}}>{item['Efficiency Score']}</div>
                      <div className="score-label">Efficiency</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card">
              <div className="card-header"><div className="card-title"><h3>Key Insights</h3></div></div>
              <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem'}}>
                {data.insights.map((insight, idx) => (
                  <li key={idx} style={{display: 'flex', gap: '0.75rem', fontSize: '0.875rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem'}}>
                    <i className="ph-fill ph-lightbulb" style={{color: '#0ea5e9', fontSize: '1.25rem'}}></i>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {data.attentionRequired.length > 0 && (
            <div className="card" style={{marginBottom: '2rem', borderLeft: '4px solid #ef4444'}}>
              <div className="card-header"><div className="card-title"><h3>Locations Requiring Attention</h3></div></div>
              <div style={{padding: '1rem 1.5rem'}}>
                {data.attentionRequired.map((item, idx) => (
                  <div key={idx} style={{backgroundColor: '#fef2f2', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem'}}>
                      <div>
                        <h4 style={{fontSize: '1.1rem', color: '#991b1b', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                           <i className="ph-fill ph-warning"></i> {item.location}
                        </h4>
                        <div style={{fontSize: '0.875rem', color: '#b91c1c'}}>{item.category}</div>
                      </div>
                      <div style={{display: 'flex', gap: '1.5rem', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', border: '1px solid #fca5a5'}}>
                        <div>
                          <div style={{fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b'}}>Usage</div>
                          <div style={{fontWeight: 600}}>{item.waterUsage.toLocaleString()} L</div>
                        </div>
                        <div>
                          <div style={{fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b'}}>Savings</div>
                          <div style={{fontWeight: 600, color: item.savings < 5 ? '#ef4444' : 'inherit'}}>{item.savings}%</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      {item.issues.map((issue, iidx) => (
                        <div key={iidx} style={{fontSize: '0.875rem', marginBottom: '0.5rem'}}>
                          <strong>Issue:</strong> {issue.issue} <br/>
                          <span style={{color: '#64748b'}}>Recommendation: {issue.recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="card" style={{marginBottom: '2rem', padding: '2rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <h2 style={{color: '#0f172a', marginBottom: '0.5rem'}}>AquaSave</h2>
              <h3 style={{color: '#64748b', fontWeight: 400}}>Campus Water Performance Report</h3>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem'}}>
              <div><strong>Report Period:</strong> {localFilter.month}</div>
              <div><strong>Category:</strong> {localFilter.category}</div>
              <div><strong>Location:</strong> {localFilter.location}</div>
              <div><strong>Generated Date:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
            
            <div style={{marginBottom: '2rem'}}>
              <h4 style={{marginBottom: '0.5rem'}}>Executive Summary</h4>
              <p style={{fontSize: '0.875rem', lineHeight: 1.6, color: '#334155'}}>
                During the selected period ({localFilter.month}), the campus consumed <strong>{data.summary.totalWaterUsage.toLocaleString()} litres</strong> of water and successfully saved <strong>{data.summary.totalWaterSaved.toLocaleString()} litres</strong>. The average efficiency score across monitored locations was <strong>{data.summary.averageEfficiency}/100</strong> with an average savings rate of <strong>{data.summary.averageSavings}%</strong>.
              </p>
            </div>
            
            <div>
              <h4 style={{marginBottom: '1rem'}}>Export Report</h4>
              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                <button className="btn btn-primary" onClick={downloadCSV} style={{width: 'auto'}}><i className="ph ph-file-csv" style={{marginRight: '0.5rem'}}></i> Download CSV</button>
                <button className="btn btn-secondary" onClick={printReport} style={{width: 'auto'}}><i className="ph ph-file-pdf" style={{marginRight: '0.5rem'}}></i> Download PDF</button>
                <button className="btn btn-secondary" onClick={printReport} style={{width: 'auto'}}><i className="ph ph-printer" style={{marginRight: '0.5rem'}}></i> Print Report</button>
              </div>
            </div>
          </div>
          
        </div>
      )}
      
      {recentReports.length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Recent Reports</h3></div></div>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
              <thead>
                <tr style={{borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase'}}>
                  <th style={{padding: '1rem'}}>Report Name</th>
                  <th style={{padding: '1rem'}}>Generated Date</th>
                  <th style={{padding: '1rem'}}>Filters</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, idx) => (
                  <tr key={idx} style={{borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem'}}>
                    <td style={{padding: '1rem', fontWeight: 600}}><i className="ph ph-file-text" style={{marginRight: '0.5rem', color: '#0ea5e9'}}></i> {report.name}</td>
                    <td style={{padding: '1rem'}}>{report.date}</td>
                    <td style={{padding: '1rem'}}>
                      <span style={{backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', marginRight: '0.5rem'}}>{report.category}</span>
                      <span style={{backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '0.25rem'}}>{report.location}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsView = () => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('aquasave_profile');
    return saved ? JSON.parse(saved) : { name: 'Admin', email: 'admin@aquasave.local' };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('aquasave_notifications');
    return saved ? JSON.parse(saved) : { waterAlerts: true, performanceAlerts: true, reportGen: true, leaderboardUpdates: true, systemNotifications: true };
  });

  const [monitoring, setMonitoring] = useState(() => {
    const saved = localStorage.getItem('aquasave_monitoring');
    return saved ? JSON.parse(saved) : { status: true, autoRefresh: true, interval: '30 minutes' };
  });

  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem('aquasave_thresholds');
    return saved ? JSON.parse(saved) : { highUsage: 100000, lowSavings: 5, lowEfficiency: 70 };
  });

  const [appearance, setAppearance] = useState(() => {
    const saved = localStorage.getItem('aquasave_appearance');
    return saved ? JSON.parse(saved) : { theme: 'Light', compactSidebar: false };
  });

  const [apiStatus, setApiStatus] = useState('checking');
  const [lastRefresh, setLastRefresh] = useState(() => {
    return localStorage.getItem('aquasave_last_refresh') || new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  });

  const [toastMessage, setToastMessage] = useState(null);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState(profile);
  
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdData, setPwdData] = useState({ current: '', new: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');

  const checkApiHealth = () => {
    setApiStatus('checking');
    fetch(`${API_BASE}/health`)
      .then(res => {
        if (res.ok) setApiStatus('connected');
        else setApiStatus('disconnected');
      })
      .catch(() => setApiStatus('disconnected'));
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveProfile = () => {
    setProfile(editProfileData);
    localStorage.setItem('aquasave_profile', JSON.stringify(editProfileData));
    setIsEditingProfile(false);
    showToast('✓ Profile updated successfully');
  };

  const toggleNotification = (key) => {
    const newNotifs = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifs);
    localStorage.setItem('aquasave_notifications', JSON.stringify(newNotifs));
    showToast('✓ Notification settings saved');
  };

  const updateMonitoring = (key, value) => {
    const newMon = { ...monitoring, [key]: value };
    setMonitoring(newMon);
    localStorage.setItem('aquasave_monitoring', JSON.stringify(newMon));
    showToast('✓ Monitoring settings saved');
  };

  const handleThresholdChange = (key, value) => {
    setThresholds({ ...thresholds, [key]: value });
  };

  const saveThresholds = () => {
    localStorage.setItem('aquasave_thresholds', JSON.stringify(thresholds));
    showToast('✓ Alert thresholds saved');
  };
  
  const updateAppearance = (key, value) => {
    const newApp = { ...appearance, [key]: value };
    setAppearance(newApp);
    localStorage.setItem('aquasave_appearance', JSON.stringify(newApp));
    showToast('✓ Appearance settings saved');
  };

  const refreshDataNow = () => {
    const now = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    setLastRefresh(now);
    localStorage.setItem('aquasave_last_refresh', now);
    showToast('✓ Water data refreshed successfully');
    checkApiHealth();
  };

  const handleChangePassword = () => {
    if (pwdData.new !== pwdData.confirm) {
      setPwdError('New passwords do not match');
      return;
    }
    if (pwdData.new.length < 6) {
      setPwdError('Password must be at least 6 characters');
      return;
    }
    setIsChangingPwd(false);
    setPwdData({ current: '', new: '', confirm: '' });
    setPwdError('');
    showToast('✓ Password changed successfully');
  };

  const resetPreferences = () => {
    if (window.confirm("Are you sure you want to reset your application preferences?")) {
      localStorage.removeItem('aquasave_notifications');
      localStorage.removeItem('aquasave_monitoring');
      localStorage.removeItem('aquasave_thresholds');
      localStorage.removeItem('aquasave_appearance');
      
      setNotifications({ waterAlerts: true, performanceAlerts: true, reportGen: true, leaderboardUpdates: true, systemNotifications: true });
      setMonitoring({ status: true, autoRefresh: true, interval: '30 minutes' });
      setThresholds({ highUsage: 100000, lowSavings: 5, lowEfficiency: 70 });
      setAppearance({ theme: 'Light', compactSidebar: false });
      
      showToast('✓ Preferences reset to defaults');
    }
  };

  const ToggleSwitch = ({ label, checked, onChange }) => (
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9'}}>
      <span style={{fontSize: '0.875rem', fontWeight: 500, color: '#334155'}}>{label}</span>
      <div 
        onClick={onChange}
        style={{
          width: '44px', height: '24px', borderRadius: '12px', 
          backgroundColor: checked ? '#10b981' : '#cbd5e1',
          position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
        }}
      >
        <div style={{
          width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
          position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}/>
      </div>
    </div>
  );

  return (
    <div className="dashboard-body" style={{position: 'relative'}}>
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: '#10b981', color: 'white',
          padding: '1rem 1.5rem', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          zIndex: 9999, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {toastMessage}
        </div>
      )}

      <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px'}}>
        
        <div className="card" style={{padding: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#0ea5e9', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700
              }}>
                {profile.name.charAt(0)}
              </div>
              <div>
                <h3 style={{fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.25rem'}}>{profile.name}</h3>
                <div style={{fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem'}}>Administrator</div>
                <div style={{fontSize: '0.875rem', color: '#64748b'}}>{profile.email}</div>
              </div>
            </div>
            <button className="btn btn-secondary" style={{width: 'auto', padding: '0.5rem 1rem'}} onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
          </div>
          
          {isEditingProfile && (
            <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem'}}>NAME</label>
                  <input className="captcha-input" type="text" value={editProfileData.name} onChange={e => setEditProfileData({...editProfileData, name: e.target.value})} />
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem'}}>EMAIL</label>
                  <input className="captcha-input" type="email" value={editProfileData.email} onChange={e => setEditProfileData({...editProfileData, email: e.target.value})} />
                </div>
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <button className="btn btn-primary" style={{width: 'auto', padding: '0.5rem 1.5rem'}} onClick={saveProfile}>Save</button>
                <button className="btn btn-secondary" style={{width: 'auto', padding: '0.5rem 1.5rem'}} onClick={() => { setIsEditingProfile(false); setEditProfileData(profile); }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Notifications</h3></div></div>
          <div style={{padding: '0 1.5rem 1.5rem 1.5rem'}}>
            <ToggleSwitch label="Water Usage Alerts" checked={notifications.waterAlerts} onChange={() => toggleNotification('waterAlerts')} />
            <ToggleSwitch label="Performance Alerts" checked={notifications.performanceAlerts} onChange={() => toggleNotification('performanceAlerts')} />
            <ToggleSwitch label="Report Generation Notifications" checked={notifications.reportGen} onChange={() => toggleNotification('reportGen')} />
            <ToggleSwitch label="Leaderboard Updates" checked={notifications.leaderboardUpdates} onChange={() => toggleNotification('leaderboardUpdates')} />
            <ToggleSwitch label="System Notifications" checked={notifications.systemNotifications} onChange={() => toggleNotification('systemNotifications')} />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Water Monitoring</h3></div></div>
          <div style={{padding: '0 1.5rem 1.5rem 1.5rem'}}>
            <ToggleSwitch label="Monitoring Status" checked={monitoring.status} onChange={() => updateMonitoring('status', !monitoring.status)} />
            <ToggleSwitch label="Automatic Data Refresh" checked={monitoring.autoRefresh} onChange={() => updateMonitoring('autoRefresh', !monitoring.autoRefresh)} />
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #f1f5f9'}}>
              <span style={{fontSize: '0.875rem', fontWeight: 500, color: '#334155'}}>Refresh Interval</span>
              <select className="captcha-input" style={{width: 'auto', padding: '0.4rem 1rem'}} value={monitoring.interval} onChange={(e) => updateMonitoring('interval', e.target.value)}>
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="6 hours">6 hours</option>
                <option value="24 hours">24 hours</option>
              </select>
            </div>
            
            <div style={{marginTop: '1.5rem'}}>
              <button className="btn btn-secondary" style={{width: 'auto'}} onClick={refreshDataNow}>Refresh Data Now</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Alert Thresholds</h3></div></div>
          <div style={{padding: '0 1.5rem 1.5rem 1.5rem'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <label style={{fontSize: '0.875rem', fontWeight: 500}}>High Water Usage Threshold (L)</label>
                <input className="captcha-input" type="number" style={{width: '120px'}} value={thresholds.highUsage} onChange={e => handleThresholdChange('highUsage', parseInt(e.target.value))} />
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <label style={{fontSize: '0.875rem', fontWeight: 500}}>Low Savings Threshold (%)</label>
                <input className="captcha-input" type="number" style={{width: '120px'}} value={thresholds.lowSavings} onChange={e => handleThresholdChange('lowSavings', parseInt(e.target.value))} />
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <label style={{fontSize: '0.875rem', fontWeight: 500}}>Low Efficiency Threshold (0-100)</label>
                <input className="captcha-input" type="number" style={{width: '120px'}} value={thresholds.lowEfficiency} onChange={e => handleThresholdChange('lowEfficiency', parseInt(e.target.value))} />
              </div>
            </div>
            <button className="btn btn-primary" style={{width: 'auto'}} onClick={saveThresholds}>Save Thresholds</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Appearance</h3></div></div>
          <div style={{padding: '0 1.5rem 1.5rem 1.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0 1rem 0', borderBottom: '1px solid #f1f5f9'}}>
              <span style={{fontSize: '0.875rem', fontWeight: 500, color: '#334155'}}>Theme</span>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                {['Light', 'Dark', 'System'].map(t => (
                  <button 
                    key={t}
                    className={`btn ${appearance.theme === t ? 'btn-primary' : 'btn-secondary'}`}
                    style={{padding: '0.4rem 1rem', width: 'auto'}}
                    onClick={() => updateAppearance('theme', t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <ToggleSwitch label="Compact Sidebar" checked={appearance.compactSidebar} onChange={() => updateAppearance('compactSidebar', !appearance.compactSidebar)} />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Data & System</h3></div></div>
          <div style={{padding: '0 1.5rem 1.5rem 1.5rem'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem'}}>
              <div>
                <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem'}}>Data Source</div>
                <div style={{fontSize: '0.875rem', fontWeight: 500}}>AquaSave_Water_Data.csv</div>
              </div>
              <div>
                <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem'}}>Backend</div>
                <div style={{fontSize: '0.875rem', fontWeight: 500}}>FastAPI</div>
              </div>
              <div>
                <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem'}}>Data Processing</div>
                <div style={{fontSize: '0.875rem', fontWeight: 500}}>Python + pandas</div>
              </div>
              <div>
                <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem'}}>Database</div>
                <div style={{fontSize: '0.875rem', fontWeight: 500}}>Not configured</div>
              </div>
              <div>
                <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem'}}>API Status</div>
                <div style={{fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: apiStatus === 'connected' ? '#10b981' : apiStatus === 'disconnected' ? '#ef4444' : '#f59e0b'}}>
                  <span style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor'}}></span>
                  {apiStatus === 'connected' ? 'Connected' : apiStatus === 'checking' ? 'Checking...' : 'Disconnected'}
                </div>
                {apiStatus === 'disconnected' && (
                  <div style={{fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem'}}>Backend connection unavailable.</div>
                )}
              </div>
              <div>
                <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem'}}>Last Data Refresh</div>
                <div style={{fontSize: '0.875rem', fontWeight: 500}}>{lastRefresh}</div>
              </div>
            </div>
            
            <div style={{display: 'flex', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem'}}>
               <button className="btn btn-secondary" style={{width: 'auto'}} onClick={refreshDataNow}>Refresh Data</button>
               {apiStatus === 'disconnected' && <button className="btn btn-secondary" style={{width: 'auto'}} onClick={checkApiHealth}>Retry Connection</button>}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Security</h3></div></div>
          <div style={{padding: '0 1.5rem 1.5rem 1.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <div style={{fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem'}}>Password</div>
                <div style={{fontSize: '1rem', letterSpacing: '2px', color: '#64748b'}}>••••••••</div>
              </div>
              <button className="btn btn-secondary" style={{width: 'auto', padding: '0.5rem 1rem'}} onClick={() => setIsChangingPwd(!isChangingPwd)}>Change Password</button>
            </div>
            
            {isChangingPwd && (
              <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', maxWidth: '400px'}}>
                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem'}}>CURRENT PASSWORD</label>
                  <input className="captcha-input" type="password" value={pwdData.current} onChange={e => setPwdData({...pwdData, current: e.target.value})} />
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem'}}>NEW PASSWORD</label>
                  <input className="captcha-input" type="password" value={pwdData.new} onChange={e => setPwdData({...pwdData, new: e.target.value})} />
                </div>
                <div style={{marginBottom: '1.5rem'}}>
                  <label style={{display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem'}}>CONFIRM NEW PASSWORD</label>
                  <input className="captcha-input" type="password" value={pwdData.confirm} onChange={e => setPwdData({...pwdData, confirm: e.target.value})} />
                </div>
                {pwdError && <div style={{color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem'}}>{pwdError}</div>}
                
                <div style={{display: 'flex', gap: '1rem'}}>
                  <button className="btn btn-primary" style={{width: 'auto', padding: '0.5rem 1.5rem'}} onClick={handleChangePassword}>Save Password</button>
                  <button className="btn btn-secondary" style={{width: 'auto', padding: '0.5rem 1.5rem'}} onClick={() => setIsChangingPwd(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{border: '1px solid #fecaca'}}>
          <div className="card-header" style={{borderBottom: '1px solid #fecaca', backgroundColor: '#fef2f2', borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem'}}>
             <div className="card-title"><h3 style={{color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><i className="ph-fill ph-warning"></i> Danger Zone</h3></div>
          </div>
          <div style={{padding: '1.5rem'}}>
            <p style={{fontSize: '0.875rem', color: '#475569', marginBottom: '1rem'}}>Resetting preferences will restore all application settings, thresholds, and notification preferences to their default values. Data will not be deleted.</p>
            <button className="btn" style={{width: 'auto', backgroundColor: '#ef4444', color: 'white'}} onClick={resetPreferences}>Reset Application Preferences</button>
          </div>
        </div>

      </div>
    </div>
  );
};

const AnalyticsView = ({ filter, setFilter, months, locations }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalytics = () => {
    setLoading(true);
    setError(false);
    let q = `month=${filter.month}`;
    if (filter.category !== 'All Categories') q += `&category=${filter.category}`;
    if (filter.location !== 'All Locations') q += `&location=${filter.location}`;
    
    fetch(`${API_BASE}/analytics?${q}`)
      .then(res => { if(!res.ok) throw new Error(); return res.json(); })
      .then(d => { setData(d); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filter.month, filter.category, filter.location]);

  useEffect(() => {
    if (!data || loading || error) return;
    
    const chartConfigs = [
      { id: 'trendChart', type: 'line', labels: data.monthlyTrend.map(d => d.Month), dataKey: 'Water Used (Litres)', source: data.monthlyTrend, color: '#0ea5e9' },
      { id: 'savingsChart', type: 'bar', labels: data.waterSavingsTrend.map(d => d.Month), dataKey: 'Water Saved (Litres)', source: data.waterSavingsTrend, color: '#10b981' },
      { id: 'locCompChart', type: 'bar', labels: data.locationComparison.map(d => d.Location), dataKey: 'Water Used (Litres)', source: data.locationComparison, color: '#6366f1', horizontal: true },
      { id: 'effChart', type: 'bar', labels: data.efficiencyByLocation.map(d => d.Location), dataKey: 'Efficiency Score', source: data.efficiencyByLocation, color: '#a855f7' },
      { id: 'savPctChart', type: 'bar', labels: data.savingsByLocation.map(d => d.Location), dataKey: 'Savings (%)', source: data.savingsByLocation, color: '#f59e0b' }
    ];

    chartConfigs.forEach(config => {
      const ctx = document.getElementById(config.id);
      if (ctx) {
        const existing = Chart.getChart(ctx);
        if (existing) existing.destroy();
        
        new Chart(ctx, {
          type: config.type,
          data: {
            labels: config.labels,
            datasets: [{
              label: config.dataKey,
              data: config.source.map(d => d[config.dataKey]),
              backgroundColor: config.type === 'line' ? `${config.color}22` : config.color,
              borderColor: config.color,
              borderWidth: config.type === 'line' ? 2 : 0,
              fill: config.type === 'line',
              tension: 0.4
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            indexAxis: config.horizontal ? 'y' : 'x',
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: '#f1f5f9' }, display: !config.horizontal },
              x: { beginAtZero: true, grid: { color: '#f1f5f9' }, display: config.horizontal }
            }
          }
        });
      }
    });

    // Donut chart
    const catCtx = document.getElementById('catDonutChart');
    if (catCtx && data.categoryComparison.length > 0) {
      const existing = Chart.getChart(catCtx);
      if (existing) existing.destroy();
      new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: data.categoryComparison.map(d => d.Category),
          datasets: [{
            data: data.categoryComparison.map(d => d['Water Used (Litres)']),
            backgroundColor: ['#0ea5e9', '#10b981', '#f59e0b'],
            borderWidth: 0
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
      });
    }

  }, [data, loading, error]);

  if (loading) return <LoadingState />;
  if (error) return (
    <div style={{padding: '4rem', textAlign: 'center', color: '#ef4444'}}>
      <i className="ph-fill ph-warning-circle" style={{fontSize: '3rem', marginBottom: '1rem'}}></i>
      <p>Unable to load analytics data.</p>
      <button className="btn btn-secondary" style={{width: 'auto', margin: '1.5rem auto 0'}} onClick={fetchAnalytics}>Retry</button>
    </div>
  );

  const getStatus = (score) => {
    if (score >= 90) return { text: 'Excellent', color: '#10b981' };
    if (score >= 75) return { text: 'Good', color: '#0ea5e9' };
    return { text: 'Needs Attention', color: '#f59e0b' };
  };
  
  const status = getStatus(data.kpis.efficiencyScore);

  return (
    <div className="dashboard-body">
      <FilterBar months={months} locations={locations} filter={filter} setFilter={setFilter} />

      <div className="cards-grid" style={{marginBottom: '2rem'}}>
        <StatCard title="Total Water Usage" value={`${data.kpis.totalWaterUsage.toLocaleString()} L`} iconClass="icon-blue" icon="ph-waves" />
        <StatCard title="Water Saved" value={`${data.kpis.waterSaved.toLocaleString()} L`} iconClass="icon-green" icon="ph-leaf" />
        <StatCard title="Avg Savings" value={`${data.kpis.averageSavings}%`} iconClass="icon-orange" icon="ph-trend-down" />
        <StatCard title="Efficiency Score" value={`${data.kpis.efficiencyScore}`} iconClass="icon-purple" icon="ph-gauge" />
      </div>

      <div className="charts-grid" style={{marginBottom: '2rem', gridTemplateColumns: '1fr'}}>
        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Water Consumption Trend</h3></div></div>
          <div className="chart-container"><canvas id="trendChart"></canvas></div>
        </div>
      </div>

      <div className="charts-grid" style={{marginBottom: '2rem', gridTemplateColumns: '2fr 1fr'}}>
        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Water Savings Trend</h3></div></div>
          <div className="chart-container"><canvas id="savingsChart"></canvas></div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Usage by Category</h3></div></div>
          <div className="chart-container" style={{height: '250px'}}><canvas id="catDonutChart"></canvas></div>
        </div>
      </div>

      <div className="charts-grid" style={{marginBottom: '2rem', gridTemplateColumns: '1fr'}}>
        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Water Usage by Location</h3></div></div>
          <div className="chart-container" style={{height: '350px'}}><canvas id="locCompChart"></canvas></div>
        </div>
      </div>

      <div className="charts-grid" style={{marginBottom: '2rem', gridTemplateColumns: '1fr 1fr'}}>
        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Efficiency Score by Location</h3></div></div>
          <div className="chart-container"><canvas id="effChart"></canvas></div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Savings Percentage by Location</h3></div></div>
          <div className="chart-container"><canvas id="savPctChart"></canvas></div>
        </div>
      </div>

      <div className="bottom-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Key Insights</h3></div></div>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {data.insights.map((insight, idx) => (
              <li key={idx} style={{display: 'flex', gap: '0.75rem', fontSize: '0.875rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem'}}>
                <i className="ph-fill ph-lightbulb" style={{color: '#f59e0b', fontSize: '1.25rem'}}></i>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
          
          <div style={{marginTop: '2rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem'}}>
             <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem'}}>Campus Water Performance</div>
             <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: status.color}}></div>
                <span style={{fontWeight: 700, fontSize: '1.1rem', color: '#0f172a'}}>{status.text}</span>
             </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header"><div className="card-title"><h3>Top Water Saving Locations</h3></div></div>
          <div className="leaderboard-list">
            {data.topPerformers.map((item, idx) => (
              <div className="leaderboard-item" key={idx}>
                <div className={`rank-badge rank-${idx+1 > 3 ? 'other' : idx+1}`}>{idx+1}</div>
                <div className="lb-info">
                  <div className="lb-name">{item.Location}</div>
                  <div className="lb-saved">{item['Water Saved (Litres)'].toLocaleString()} L Saved</div>
                </div>
                <div className="lb-score" style={{textAlign: 'right'}}>
                  <div className="score-val">{item['Savings (%)']}%</div>
                  <div className="score-label">Savings</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


const Dashboard = () => {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [months, setMonths] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState({ month: 'All Months', category: 'All Categories', location: 'All Locations' });
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [metaError, setMetaError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/months`).then(res => res.json()),
      fetch(`${API_BASE}/locations`).then(res => res.json())
    ]).then(([m, l]) => {
      setMonths(m);
      setLocations(l);
      setMetaLoaded(true);
    }).catch(() => {
      setMetaError(true);
    });
  }, []);

  const titles = {
    'dashboard': { t: 'Dashboard', s: 'Campus water performance overview' },
    'water-usage': { t: 'Water Usage', s: 'Detailed breakdown of consumption' },
    'leaderboard': { t: 'Leaderboard', s: 'Campus rankings and efficiency' },
    'analytics': { t: 'Analytics', s: 'Advanced metrics and forecasting' },
    'alerts': { t: 'Smart Alerts', s: 'AI-driven insights and warnings' },
    'reports': { t: 'Reports', s: 'Downloadable performance summaries' },
    'settings': { t: 'Settings', s: 'Application configuration' }
  };

  if (metaError) {
    return (
      <div className="dashboard-layout">
        <main className="main-content" style={{marginLeft: 0}}>
          <ErrorState message="Unable to connect to FastAPI backend. Ensure uvicorn is running on port 8000." />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        <Header setMobileOpen={setMobileOpen} title={titles[activeTab].t} subtitle={titles[activeTab].s} />
        
        {!metaLoaded ? <LoadingState /> : (
          <>
            {activeTab === 'dashboard' && <DashboardView filter={filter} setFilter={setFilter} setActiveTab={setActiveTab} />}
            {activeTab === 'water-usage' && <WaterUsageView filter={filter} setFilter={setFilter} months={months} locations={locations} />}
            {activeTab === 'leaderboard' && <LeaderboardView filter={filter} setFilter={setFilter} months={months} />}
            {activeTab === 'alerts' && <AlertsView filter={filter} setFilter={setFilter} months={months} />}
            {activeTab === 'analytics' && <AnalyticsView filter={filter} setFilter={setFilter} months={months} locations={locations} />}
            {activeTab === 'reports' && <ReportsView months={months} locations={locations} />}
            {activeTab === 'settings' && <SettingsView />}
          </>
        )}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Dashboard />);
