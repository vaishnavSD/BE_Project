import React, { useState, useEffect } from "react";
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert, Platform
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";
import AdminProtected from "./components/admin-protected";
import { BarChart } from "./components/chart-components";

interface MonthlyTrend {
  month: number;
  collections: number;
  revenue: number;
}

interface MonthlyCategoryRevenue {
  month: number;
  categories: { [category: string]: number };
}

interface Agent {
  agentname: string;
  agent_MobileNo: string;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Reports() {
  const navigation = useNavigation();
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => 2023 + i).reverse();

  // Chart state
  const [selectedYear, setSelectedYear]   = useState(currentYear);
  const [chartLoading, setChartLoading]   = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [monthlyCategoryRevenue, setMonthlyCategoryRevenue] = useState<MonthlyCategoryRevenue[]>([]);

  // PDF section state
  const [agentsList, setAgentsList]         = useState<Agent[]>([]);
  const [pdfLoading, setPdfLoading]         = useState(false);
  const [pdfReportType, setPdfReportType]   = useState<'yearly' | 'monthly'>('yearly');
  const [pdfYear, setPdfYear]               = useState(currentYear);
  const [pdfMonth, setPdfMonth]             = useState(new Date().getMonth() + 1);
  const [pdfCategory, setPdfCategory]       = useState('all');
  const [pdfAgent, setPdfAgent]             = useState('all');

  const apiClient = createRobustApiClient();

  // ── Fetching ──────────────────────────────────────────────────────────────

  const fetchReportsData = async () => {
    try {
      setError(null);
      await Promise.all([
        fetchMonthlyData(selectedYear),
        fetchMonthlyCategoryData(selectedYear),
        fetchAgentsList(),
      ]);
    } catch (err: any) {
      let msg = 'Failed to load reports data.';
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error')
        msg = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
      else if (err.response?.status === 404)
        msg = 'Reports endpoint not found.';
      else if (err.response?.status >= 500)
        msg = 'Server error. Please try again later.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMonthlyData = async (year: number) => {
    try {
      setChartLoading(true);
      const res = await apiClient.get(`${API_ENDPOINTS.REPORTS}/monthly?year=${year}`);
      setMonthlyTrends(res.data || []);
    } catch { setMonthlyTrends([]); }
    finally { setChartLoading(false); }
  };

  const fetchMonthlyCategoryData = async (year: number) => {
    try {
      const res = await apiClient.get(`${API_ENDPOINTS.REPORTS}/monthly-category?year=${year}`);
      setMonthlyCategoryRevenue(res.data || []);
      const cats = new Set<string>();
      (res.data || []).forEach((m: MonthlyCategoryRevenue) =>
        Object.keys(m.categories || {}).forEach(c => cats.add(c))
      );
      setAvailableCategories(['all', ...Array.from(cats)]);
    } catch {
      setMonthlyCategoryRevenue([]);
      setAvailableCategories(['all']);
    }
  };

  const fetchAgentsList = async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.REPORTS_AGENTS_LIST);
      setAgentsList(res.data || []);
    } catch { setAgentsList([]); }
  };

  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    setChartLoading(true);
    try {
      await Promise.all([fetchMonthlyData(year), fetchMonthlyCategoryData(year)]);
    } finally { setChartLoading(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchReportsData(); };

  useEffect(() => { fetchReportsData(); }, []);

  // ── PDF ───────────────────────────────────────────────────────────────────

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      // 1. Build query string
      const qs: Record<string, string> = {
        type: pdfReportType,
        year: pdfYear.toString(),
      };
      if (pdfReportType === 'monthly') qs.month = pdfMonth.toString();
      if (pdfCategory !== 'all') qs.category = pdfCategory;
      if (pdfAgent !== 'all') qs.agentMobile = pdfAgent;

      const queryString = Object.entries(qs).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

      // 2. Fetch report data from backend
      let reportData: any;
      try {
        const res = await apiClient.get(`${API_ENDPOINTS.REPORTS_FILTERED}?${queryString}`);
        reportData = res.data;
      } catch (fetchErr: any) {
        const msg = fetchErr?.response?.data?.detail || fetchErr?.response?.data?.error || fetchErr?.message || 'Network error';
        Alert.alert('Failed to fetch report data', msg);
        return;
      }

      // 3. Build HTML
      const html = buildPdfHtml(reportData);

      // 4. Generate PDF file
      let uri: string;
      try {
        const result = await Print.printToFileAsync({ html });
        uri = result.uri;
      } catch (printErr: any) {
        Alert.alert('PDF generation failed', printErr?.message || 'Unknown error');
        return;
      }

      // 5. Share / save
      if (Platform.OS === 'web') {
        Alert.alert('Success', 'PDF generated successfully!');
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save or Share Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Ready', `Saved to:\n${uri}`);
      }
    } catch (err: any) {
      console.error('PDF unexpected error:', err);
      Alert.alert('Error', err?.message || 'Failed to generate PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  const buildPdfHtml = (data: any): string => {
    const { filters, summary, monthly, categories, agents } = data;

    const periodLabel = filters.type === 'monthly'
      ? `${MONTH_NAMES[(filters.month || 1) - 1]} ${filters.year}`
      : `Full Year ${filters.year}`;

    const agentLabel = filters.agentMobile && filters.agentMobile !== 'all'
      ? (agentsList.find(a => a.agent_MobileNo === filters.agentMobile)?.agentname || filters.agentMobile)
      : 'All Agents';

    const catLabel = filters.category && filters.category !== 'all'
      ? filters.category : 'All Categories';

    const fmt = (n: any) =>
      `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const monthRows = (monthly || []).map((m: any) => `
      <tr>
        <td>${MONTH_NAMES[m.month - 1]}</td>
        <td style="text-align:center">${m.collections}</td>
        <td style="text-align:right">${fmt(m.revenue)}</td>
      </tr>`).join('') || '<tr><td colspan="3" style="text-align:center;color:#999">No data</td></tr>';

    const catRows = (categories || []).map((c: any) => `
      <tr>
        <td>${c.category || '-'}</td>
        <td style="text-align:center">${parseFloat(c.totalWeight || 0).toFixed(2)} kg</td>
        <td style="text-align:center">${c.items}</td>
        <td style="text-align:right">${fmt(c.revenue)}</td>
      </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:#999">No data</td></tr>';

    const agentRows = (agents || []).map((a: any) => `
      <tr>
        <td>${a.agentname || '-'}</td>
        <td>${a.agent_MobileNo || '-'}</td>
        <td style="text-align:center">${a.collections}</td>
        <td style="text-align:right">${fmt(a.revenue)}</td>
      </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:#999">No data</td></tr>';

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; padding: 32px; color: #2c3e50; background: #fff; }
  .logo { font-size: 28px; font-weight: bold; color: #667eea; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #7f8c8d; margin-bottom: 24px; }
  .filter-bar {
    background: #f0f4ff; border-radius: 10px; padding: 12px 18px;
    margin-bottom: 24px; display: flex; gap: 24px; font-size: 13px; flex-wrap: wrap;
  }
  .filter-bar b { color: #667eea; }
  .stats { display: flex; gap: 14px; margin-bottom: 28px; }
  .stat {
    flex: 1; background: linear-gradient(135deg, #667eea, #764ba2);
    color: white; border-radius: 12px; padding: 18px 16px; text-align: center;
  }
  .stat .val { font-size: 24px; font-weight: bold; }
  .stat .lbl { font-size: 11px; opacity: 0.85; margin-top: 5px; letter-spacing: 0.5px; }
  h2 {
    font-size: 15px; color: #2c3e50; margin: 28px 0 10px;
    padding-bottom: 6px; border-bottom: 2px solid #667eea;
  }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th {
    background: #667eea; color: white; padding: 9px 12px;
    text-align: left; font-weight: 600;
  }
  td { padding: 8px 12px; border-bottom: 1px solid #e9ecef; }
  tr:nth-child(even) td { background: #f8f9fa; }
  .footer { margin-top: 36px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
</style>
</head>
<body>
  <div class="logo">♻ ScrapWale</div>
  <div class="subtitle">Scrap Collection Report &bull; Generated on ${new Date().toLocaleString('en-IN')}</div>

  <div class="filter-bar">
    <span><b>Period:</b> ${periodLabel}</span>
    <span><b>Category:</b> ${catLabel}</span>
    <span><b>Agent:</b> ${agentLabel}</span>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="val">${summary?.totalCollections || 0}</div>
      <div class="lbl">TOTAL COLLECTIONS</div>
    </div>
    <div class="stat">
      <div class="val">${fmt(summary?.totalRevenue)}</div>
      <div class="lbl">TOTAL REVENUE</div>
    </div>
    <div class="stat">
      <div class="val">${summary?.agentsCount || 0}</div>
      <div class="lbl">AGENTS ACTIVE</div>
    </div>
  </div>

  ${filters.type === 'yearly' ? `
  <h2>📅 Monthly Breakdown</h2>
  <table>
    <thead><tr><th>Month</th><th style="text-align:center">Collections</th><th style="text-align:right">Revenue</th></tr></thead>
    <tbody>${monthRows}</tbody>
  </table>` : ''}

  <h2>📦 Category Breakdown</h2>
  <table>
    <thead><tr><th>Category</th><th style="text-align:center">Weight</th><th style="text-align:center">Items</th><th style="text-align:right">Revenue</th></tr></thead>
    <tbody>${catRows}</tbody>
  </table>

  <h2>👤 Agent Performance</h2>
  <table>
    <thead><tr><th>Agent Name</th><th>Mobile</th><th style="text-align:center">Collections</th><th style="text-align:right">Revenue</th></tr></thead>
    <tbody>${agentRows}</tbody>
  </table>

  <div class="footer">ScrapWale Admin Report &bull; ${new Date().getFullYear()} &bull; Confidential</div>
</body>
</html>`;
  };

  // ── Chart data ────────────────────────────────────────────────────────────

  const monthlyRevenueData = monthlyTrends.map(t => ({
    label: MONTH_SHORT[t.month - 1],
    value: t.revenue,
    color: '#667eea',
  }));

  const categoryRevenueData = selectedCategory === 'all' ? [] : [{
    color: '#FF6B6B',
    data: monthlyCategoryRevenue.map(m => ({
      month: MONTH_SHORT[m.month - 1],
      value: m.categories[selectedCategory] || 0,
    })),
  }];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminProtected>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard' as never)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Revenue Reports</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchReportsData}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Year selector */}
              <View style={styles.yearRow}>
                <Text style={styles.pickerLabel}>Year:</Text>
                <View style={styles.pickerBox}>
                  <Picker selectedValue={selectedYear} onValueChange={handleYearChange} style={styles.picker} mode="dropdown">
                    {years.map(y => <Picker.Item key={y} label={y.toString()} value={y} />)}
                  </Picker>
                </View>
              </View>

              {/* Monthly Revenue Chart */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>📈 Monthly Revenue</Text>
                {chartLoading ? (
                  <View style={styles.chartLoading}><ActivityIndicator size="small" color="#667eea" /></View>
                ) : monthlyRevenueData.length > 0 ? (
                  <BarChart title="" data={monthlyRevenueData} />
                ) : (
                  <View style={styles.noData}><Text style={styles.noDataText}>No data for {selectedYear}</Text></View>
                )}
              </View>

              {/* Category Revenue Chart */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>📦 Monthly Revenue by Category</Text>
                <View style={styles.catPickerRow}>
                  <Text style={styles.pickerLabel}>Category:</Text>
                  <View style={styles.pickerBox}>
                    <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory} style={styles.picker} mode="dropdown">
                      {availableCategories.map(c => (
                        <Picker.Item key={c} label={c === 'all' ? 'Select a category...' : c} value={c} />
                      ))}
                    </Picker>
                  </View>
                </View>
                {chartLoading ? (
                  <View style={styles.chartLoading}><ActivityIndicator size="small" color="#667eea" /></View>
                ) : selectedCategory === 'all' ? (
                  <View style={styles.noData}><Text style={styles.noDataText}>Select a category to view data</Text></View>
                ) : categoryRevenueData.length > 0 ? (
                  categoryRevenueData.map((cd, i) => (
                    <BarChart key={i} title="" data={cd.data.map(d => ({ label: d.month, value: d.value, color: cd.color }))} />
                  ))
                ) : (
                  <View style={styles.noData}><Text style={styles.noDataText}>No data for {selectedCategory} in {selectedYear}</Text></View>
                )}
              </View>

              {/* ── Download PDF Section ── */}
              <View style={styles.pdfCard}>
                <View style={styles.pdfCardHeader}>
                  <Text style={styles.pdfCardIcon}>📥</Text>
                  <View>
                    <Text style={styles.pdfCardTitle}>Download PDF Report</Text>
                    <Text style={styles.pdfCardSub}>Select filters and generate a report</Text>
                  </View>
                </View>

                {/* Report Type toggle */}
                <Text style={styles.filterLabel}>Report Type</Text>
                <View style={styles.segmentRow}>
                  {(['yearly', 'monthly'] as const).map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.segBtn, pdfReportType === t && styles.segBtnActive]}
                      onPress={() => setPdfReportType(t)}
                    >
                      <Text style={[styles.segText, pdfReportType === t && styles.segTextActive]}>
                        {t === 'yearly' ? '📅 Yearly' : '🗓 Monthly'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Year */}
                <Text style={styles.filterLabel}>Year</Text>
                <View style={styles.filterPickerBox}>
                  <Picker selectedValue={pdfYear} onValueChange={setPdfYear} style={styles.picker} mode="dropdown">
                    {years.map(y => <Picker.Item key={y} label={y.toString()} value={y} />)}
                  </Picker>
                </View>

                {/* Month — only for monthly */}
                {pdfReportType === 'monthly' && (
                  <>
                    <Text style={styles.filterLabel}>Month</Text>
                    <View style={styles.filterPickerBox}>
                      <Picker selectedValue={pdfMonth} onValueChange={setPdfMonth} style={styles.picker} mode="dropdown">
                        {MONTH_NAMES.map((m, i) => <Picker.Item key={i} label={m} value={i + 1} />)}
                      </Picker>
                    </View>
                  </>
                )}

                {/* Scrap Category */}
                <Text style={styles.filterLabel}>Scrap Category</Text>
                <View style={styles.filterPickerBox}>
                  <Picker selectedValue={pdfCategory} onValueChange={setPdfCategory} style={styles.picker} mode="dropdown">
                    <Picker.Item label="All Categories" value="all" />
                    {availableCategories.filter(c => c !== 'all').map(c => (
                      <Picker.Item key={c} label={c} value={c} />
                    ))}
                  </Picker>
                </View>

                {/* Agent */}
                <Text style={styles.filterLabel}>Agent</Text>
                <View style={styles.filterPickerBox}>
                  <Picker selectedValue={pdfAgent} onValueChange={setPdfAgent} style={styles.picker} mode="dropdown">
                    <Picker.Item label="All Agents" value="all" />
                    {agentsList.map(a => (
                      <Picker.Item key={a.agent_MobileNo} label={a.agentname} value={a.agent_MobileNo} />
                    ))}
                  </Picker>
                </View>

                {/* Download button */}
                <TouchableOpacity
                  style={[styles.downloadBtn, pdfLoading && styles.downloadBtnDisabled]}
                  onPress={handleDownloadPdf}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? (
                    <View style={styles.downloadBtnInner}>
                      <ActivityIndicator color="white" size="small" />
                      <Text style={styles.downloadBtnText}>  Generating PDF...</Text>
                    </View>
                  ) : (
                    <Text style={styles.downloadBtnText}>📄 Generate & Download PDF</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </AdminProtected>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },

  header: {
    backgroundColor: 'white', padding: 20, paddingTop: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 10,
  },
  backBtn: { padding: 8, borderRadius: 8, minWidth: 60 },
  backBtnText: { color: '#667eea', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', flex: 1, textAlign: 'center', marginLeft: -60 },
  refreshBtn: { padding: 8 },
  refreshText: { fontSize: 18 },

  content: { padding: 15, paddingBottom: 40 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
  loadingText: { marginTop: 15, fontSize: 16, color: '#7f8c8d' },
  errorText: { fontSize: 16, color: '#e74c3c', textAlign: 'center', marginBottom: 20 },
  retryBtn: { backgroundColor: '#667eea', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: 'white', fontWeight: '600' },

  yearRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  pickerLabel: { fontSize: 14, fontWeight: '600', color: '#2c3e50' },
  pickerBox: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 2, borderColor: '#667eea', height: 48, justifyContent: 'center',
  },
  picker: { height: 48, width: '100%', color: '#2c3e50' },

  chartCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 22, marginBottom: 20,
    minHeight: 320, shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
    borderWidth: 1, borderColor: '#f0f4ff',
  },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 16 },
  chartLoading: { padding: 40, alignItems: 'center' },
  noData: { padding: 40, alignItems: 'center' },
  noDataText: { fontSize: 15, color: '#7f8c8d', textAlign: 'center' },
  catPickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f4ff',
  },

  // PDF card
  pdfCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 22, marginTop: 4,
    shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 14, elevation: 6,
    borderWidth: 1.5, borderColor: '#e8edff',
  },
  pdfCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  pdfCardIcon: { fontSize: 36 },
  pdfCardTitle: { fontSize: 18, fontWeight: '700', color: '#2c3e50' },
  pdfCardSub: { fontSize: 13, color: '#7f8c8d', marginTop: 2 },

  filterLabel: {
    fontSize: 12, fontWeight: '700', color: '#7f8c8d',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: 16, marginBottom: 6,
  },
  segmentRow: { flexDirection: 'row', gap: 10 },
  segBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 2, borderColor: '#e9ecef', alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  segBtnActive: { borderColor: '#667eea', backgroundColor: '#f0f4ff' },
  segText: { fontSize: 14, fontWeight: '600', color: '#95a5a6' },
  segTextActive: { color: '#667eea' },

  filterPickerBox: {
    backgroundColor: '#f8f9fa', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    height: 50, justifyContent: 'center',
  },

  downloadBtn: {
    backgroundColor: '#667eea', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
    shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  downloadBtnDisabled: { backgroundColor: '#a0aec0', shadowOpacity: 0 },
  downloadBtnInner: { flexDirection: 'row', alignItems: 'center' },
  downloadBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
