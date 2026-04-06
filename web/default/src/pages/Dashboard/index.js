import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Grid, Statistic } from 'semantic-ui-react';
import {
  Bar, BarChart, CartesianGrid,
  Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import axios from 'axios';
import './Dashboard.css';

// ============================================
// CHART CONFIG — Precision SaaS Lite
// ============================================
const chartConfig = {
  colors: {
    requests: '#0D9488',  // Teal brand
    quota:    '#F59E0B',  // Amber accent
    tokens:   '#3B82F6',  // Blue info
  },
  barColors: [
    '#0D9488', '#F59E0B', '#3B82F6', '#10B981',
    '#8B5CF6', '#EF4444', '#F97316', '#06B6D4',
  ],
  lineChart: {
    line: { strokeWidth: 2.5, dot: false, activeDot: { r: 5 } },
    grid: { vertical: false, horizontal: true, opacity: 0.08 },
  },
};

// ============================================
// CUSTOM TOOLTIP
// ============================================
const CustomTooltip = ({ active, payload, label, formatter, labelFormatter }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      boxShadow: 'var(--shadow-lg)',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
        {labelFormatter ? labelFormatter(label) : label}
      </div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)' }}>{entry.name}:</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
            {Array.isArray(formatter) ? formatter[i]?.(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================
// MINI LINE CHART (for stat cards)
// ============================================
const MiniLineChart = ({ data, dataKey, color }) => {
  const xAxisConfig = {
    dataKey: 'date', axisLine: false, tickLine: false,
    tick: { fontSize: 0, fill: 'transparent' },
    interval: 'preserveStartEnd',
  };
  return (
    <ResponsiveContainer width="100%" height={60} margin={{ left: -10, right: -10 }}>
      <LineChart data={data} {...xAxisConfig}>
        <Tooltip content={<></>} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// ============================================
// STAT CARD
// ============================================
const StatCard = ({ icon, value, label, color, chartData, chartKey, isZh }) => (
  <Card className="stat-card" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}>
    <Card.Content>
      <div className="stat-card-icon"><i className={`${icon} icon`} style={{ margin: 0 }} /></div>
      <Statistic>
        <Statistic.Value style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          {value}
        </Statistic.Value>
        <Statistic.Label style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </Statistic.Label>
      </Statistic>
      {chartData && chartData.length > 0 && (
        <div style={{ marginTop: '8px', opacity: 0.6 }}>
          <MiniLineChart data={chartData} dataKey={chartKey} color="#fff" />
        </div>
      )}
    </Card.Content>
  </Card>
);

// ============================================
// MAIN DASHBOARD
// ============================================
const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [data, setData] = useState([]);
  const [summaryData, setSummaryData] = useState({ todayRequests: 0, todayQuota: 0, todayTokens: 0 });

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/user/dashboard');
      if (response.data.success) {
        const dashboardData = response.data.data || [];
        setData(dashboardData);
        calculateSummary(dashboardData);
      }
    } catch {
      setData([]); calculateSummary([]);
    }
  };

  const calculateSummary = (dashboardData) => {
    if (!Array.isArray(dashboardData) || !dashboardData.length) {
      setSummaryData({ todayRequests: 0, todayQuota: 0, todayTokens: 0 }); return;
    }
    const today = new Date().toISOString().split('T')[0];
    const todayData = dashboardData.filter(item => item.Day === today);
    setSummaryData({
      todayRequests: todayData.reduce((s, i) => s + i.RequestCount, 0),
      todayQuota:    todayData.reduce((s, i) => s + i.Quota, 0) / 1_000_000,
      todayTokens:   todayData.reduce((s, i) => s + i.PromptTokens + i.CompletionTokens, 0),
    });
  };

  // Process time series (7 days min)
  const processTimeSeriesData = () => {
    const dailyData = {};
    const dates = data.map(i => i.Day);
    let minDate = dates.length ? new Date(Math.min(...dates.map(d => new Date(d)))) : new Date();
    const maxDate = new Date();
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    if (minDate > sevenDaysAgo) minDate = sevenDaysAgo;
    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = { date: dateStr, requests: 0, quota: 0, tokens: 0 };
    }
    data.forEach(item => {
      if (dailyData[item.Day]) {
        dailyData[item.Day].requests += item.RequestCount;
        dailyData[item.Day].quota += item.Quota / 1_000_000;
        dailyData[item.Day].tokens += item.PromptTokens + item.CompletionTokens;
      }
    });
    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Process model stacked bar data
  const processModelData = () => {
    const timeData = {};
    const dates = data.map(i => i.Day);
    let minDate = dates.length ? new Date(Math.min(...dates.map(d => new Date(d)))) : new Date();
    const maxDate = new Date();
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    if (minDate > sevenDaysAgo) minDate = sevenDaysAgo;
    const models = [...new Set(data.map(i => i.ModelName))];
    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      timeData[dateStr] = { date: dateStr };
      models.forEach(m => { timeData[dateStr][m] = 0; });
    }
    data.forEach(item => {
      if (timeData[item.Day]) timeData[item.Day][item.ModelName] = item.PromptTokens + item.CompletionTokens;
    });
    return Object.values(timeData).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getUniqueModels = () => [...new Set(data.map(i => i.ModelName))];
  const getRandomColor = (index) => chartConfig.barColors[index % chartConfig.barColors.length];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const xAxisBase = {
    dataKey: 'date', axisLine: false, tickLine: false,
    tick: { fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' },
    tickFormatter: formatDate, interval: 0, minTickGap: 8,
  };

  const yAxisBase = {
    axisLine: false, tickLine: false,
    tick: { fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' },
  };

  const tooltipBase = {
    contentStyle: {
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
    },
    labelFormatter: (label) => formatDate(label),
  };

  const timeSeriesData = processTimeSeriesData();
  const modelData = processModelData();
  const models = getUniqueModels();

  // Format numbers for display
  const fmtNum = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : n.toString();
  const fmtQuota = (n) => `$${n.toFixed(4)}`;
  const fmtTokens = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : n.toString();

  return (
    <div className="dashboard-container">
      <div className="ui container">
        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 className="dashboard-title" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>
            {isZh ? '数据看板' : 'Dashboard'}
          </h1>
          <p className="dashboard-subtitle" style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {isZh ? '实时监控您的 API 调用与用量' : 'Monitor your API usage and performance in real time'}
          </p>
        </div>

        {/* Summary Stats Row */}
        <div className="dashboard-stats-row">
          <StatCard
            icon="zap" color="#0D9488"
            value={fmtNum(summaryData.todayRequests)}
            label={isZh ? '今日请求' : "Today's Requests"}
            chartData={timeSeriesData} chartKey="requests" isZh={isZh}
          />
          <StatCard
            icon="dollar" color="#F59E0B"
            value={fmtQuota(summaryData.todayQuota)}
            label={isZh ? '今日消费' : "Today's Cost"}
            chartData={timeSeriesData} chartKey="quota" isZh={isZh}
          />
          <StatCard
            icon="cube" color="#3B82F6"
            value={fmtTokens(summaryData.todayTokens)}
            label={isZh ? '今日 Tokens' : "Today's Tokens"}
            chartData={timeSeriesData} chartKey="tokens" isZh={isZh}
          />
          <StatCard
            icon="globe" color="#8B5CF6"
            value={models.length || '—'}
            label={isZh ? '使用模型数' : 'Models Used'}
            chartData={[]} chartKey="" isZh={isZh}
          />
        </div>

        {/* Mini Chart Cards Row */}
        <Grid columns={3} className="charts-grid" doubling stackable style={{ marginBottom: '24px' }}>
          {[
            { key: 'requests', label: isZh ? '请求量趋势' : 'Request Trend', color: chartConfig.colors.requests, fmt: (v) => fmtNum(v) },
            { key: 'quota',    label: isZh ? '消费趋势' : 'Cost Trend',      color: chartConfig.colors.quota,    fmt: (v) => fmtQuota(v) },
            { key: 'tokens',   label: isZh ? 'Token 趋势' : 'Token Trend',  color: chartConfig.colors.tokens,   fmt: (v) => fmtTokens(v) },
          ].map(({ key, label, color, fmt }) => (
            <Grid.Column key={key}>
              <Card className="chart-card">
                <Card.Content>
                  <div className="ui header" style={{ marginBottom: '12px !important', fontSize: '0.9rem !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.8rem',
                      color, background: `${color}14`, border: `1px solid ${color}30`,
                      padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    }}>
                      {fmt(summaryData[key === 'requests' ? 'todayRequests' : key === 'quota' ? 'todayQuota' : 'todayTokens'])}
                    </span>
                  </div>
                  <div className="chart-container" style={{ padding: '8px 0' }}>
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart data={timeSeriesData} margin={{ left: -15, right: 10, top: 4, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                        <XAxis {...xAxisBase} hide />
                        <YAxis hide />
                        <Tooltip {...tooltipBase} formatter={(v) => [fmt(v), '']} />
                        <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Content>
              </Card>
            </Grid.Column>
          ))}
        </Grid>

        {/* Model Usage Stacked Bar */}
        <Card className="chart-card" style={{ padding: '0' }}>
          <Card.Content style={{ padding: '24px 28px 16px !important' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {isZh ? '模型使用分布 (Tokens)' : 'Model Usage Distribution (Tokens)'}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {models.slice(0, 5).map((m, i) => (
                  <span key={m} className="model-badge">
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: getRandomColor(i), display: 'inline-block' }} />
                    {m}
                  </span>
                ))}
                {models.length > 5 && (
                  <span className="badge badge-brand" style={{ fontSize: '10px' }}>+{models.length - 5}</span>
                )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={modelData} margin={{ left: 0, right: 8, top: 4, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                <XAxis {...xAxisBase} tick={{ ...xAxisBase.tick, textAnchor: 'middle' }} interval={0} />
                <YAxis {...yAxisBase} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip {...tooltipBase} />
                <Legend
                  wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
                  iconType="circle" iconSize={8}
                />
                {models.map((model, index) => (
                  <Bar key={model} dataKey={model} stackId="a" fill={getRandomColor(index)} name={model}
                    radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
