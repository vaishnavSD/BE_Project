import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Simple Bar Chart Component
interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title: string;
  maxValue?: number;
}

export function BarChart({ data, title, maxValue }: BarChartProps) {
  const chartWidth = screenWidth - 80;
  const maxVal = maxValue || Math.max(...data.map(d => d.value));

  if (!data || data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      <View style={styles.barsContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barRow}>
            <Text style={styles.barLabel}>{item.label}</Text>
            <View style={styles.barContainer}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: maxVal > 0 ? `${(item.value / maxVal) * 100}%` : '0%',
                      backgroundColor: item.color || '#667eea',
                    },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>₹{Math.round(item.value / 1000)}k</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Simple Line Chart Component
interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  title: string;
  color?: string;
}

export function LineChart({ data, title, color = '#667eea' }: LineChartProps) {
  const chartWidth = screenWidth - 80;
  const chartHeight = 220;
  
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={[styles.lineChartContainer, { width: chartWidth, height: chartHeight }]}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const padding = 40;

  const points = data.map((item, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (chartWidth - padding * 2);
    const y = padding + ((maxValue - item.value) / range) * (chartHeight - padding * 2);
    return { x, y, value: item.value, label: item.label };
  });

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={[styles.lineChartContainer, { width: chartWidth, height: chartHeight }]}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <View
            key={index}
            style={[
              styles.gridLine,
              { 
                top: padding + ratio * (chartHeight - padding * 2), 
                left: padding,
                width: chartWidth - padding * 2 
              }
            ]}
          />
        ))}
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const value = maxValue - (ratio * range);
          return (
            <Text
              key={index}
              style={[
                styles.yAxisLabel,
                { 
                  top: padding + ratio * (chartHeight - padding * 2) - 8,
                  left: 5
                }
              ]}
            >
              ₹{Math.round(value / 1000)}k
            </Text>
          );
        })}
        
        {/* Data line path */}
        {points.length > 1 && (
          <View style={styles.lineContainer}>
            {points.map((point, index) => (
              index < points.length - 1 && (
                <View
                  key={index}
                  style={[
                    styles.lineSegment,
                    {
                      left: point.x,
                      top: point.y,
                      width: Math.sqrt(
                        Math.pow(points[index + 1].x - point.x, 2) +
                        Math.pow(points[index + 1].y - point.y, 2)
                      ),
                      transform: [
                        {
                          rotate: `${Math.atan2(
                            points[index + 1].y - point.y,
                            points[index + 1].x - point.x
                          )}rad`,
                        },
                      ],
                    },
                  ]}
                />
              )
            ))}
          </View>
        )}
        
        {/* Data points */}
        {points.map((point, index) => (
          <View key={index}>
            <View
              style={[
                styles.dataPoint,
                {
                  left: point.x - 6,
                  top: point.y - 6,
                  backgroundColor: color,
                },
              ]}
            />
            {/* Value labels - show only for every other point to avoid overlap */}
            {(index % 2 === 0 || data.length <= 6) && (
              <Text
                style={[
                  styles.valueLabel,
                  {
                    left: point.x - 25,
                    top: point.y - 30,
                  }
                ]}
              >
                ₹{Math.round(point.value / 1000)}k
              </Text>
            )}
          </View>
        ))}
        
        {/* X-axis labels */}
        <View style={[styles.labelsContainer, { top: chartHeight - 30 }]}>
          {data.map((item, index) => (
            <Text
              key={index}
              style={[
                styles.chartLabel,
                { 
                  left: padding + (index / Math.max(data.length - 1, 1)) * (chartWidth - padding * 2) - 15,
                  width: 30
                }
              ]}
            >
              {item.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

// Simple Pie Chart Component
interface PieChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  title: string;
}

export function PieChart({ data, title }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.pieChartContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.pieChartContainer}>
        {/* Simple horizontal bar representation of pie data */}
        <View style={styles.pieChart}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            return (
              <View key={index} style={styles.pieBarContainer}>
                <View style={styles.pieBarInfo}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.pieBarLabel}>{item.label}</Text>
                  <Text style={styles.pieBarPercentage}>{percentage.toFixed(1)}%</Text>
                </View>
                <View style={styles.pieBarTrack}>
                  <View 
                    style={[
                      styles.pieBarFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
        
        <View style={styles.pieLegend}>
          <Text style={styles.pieLegendTitle}>Revenue Distribution</Text>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.label}: ₹{(item.value / 1000).toFixed(1)}k ({((item.value / total) * 100).toFixed(1)}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Progress Bar Component
interface ProgressBarProps {
  value: number;
  maxValue: number;
  label: string;
  color?: string;
}

export function ProgressBar({ value, maxValue, label, color = '#667eea' }: ProgressBarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value.toLocaleString()}</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={styles.progressPercentage}>{percentage.toFixed(1)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  barsContainer: {
    gap: 14,
    paddingVertical: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  barLabel: {
    fontSize: 13,
    color: '#2c3e50',
    width: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barTrack: {
    flex: 1,
    height: 24,
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 12,
    minWidth: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  barValue: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: 'bold',
    minWidth: 45,
    textAlign: 'right',
  },
  lineChartContainer: {
    position: 'relative',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#e9ecef',
  },
  lineSegment: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#667eea',
    borderRadius: 1.5,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  labelsContainer: {
    position: 'absolute',
    bottom: -25,
    width: '100%',
  },
  chartLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
    width: 30,
  },
  noDataText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    marginTop: 80,
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  yAxisLabel: {
    position: 'absolute',
    fontSize: 9,
    color: '#7f8c8d',
    textAlign: 'right',
    width: 35,
  },
  lineContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  valueLabel: {
    position: 'absolute',
    fontSize: 8,
    color: '#667eea',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
    width: 50,
  },
  pieChartContainer: {
    alignItems: 'center',
    gap: 20,
  },
  pieChart: {
    marginBottom: 20,
  },
  pieBarContainer: {
    marginBottom: 12,
  },
  pieBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  pieBarLabel: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  pieBarPercentage: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: 'bold',
    minWidth: 45,
    textAlign: 'right',
  },
  pieBarTrack: {
    height: 8,
    backgroundColor: '#f1f3f4',
    borderRadius: 4,
    overflow: 'hidden',
  },
  pieBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  pieLegendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  pieLegend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#2c3e50',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right',
    marginTop: 4,
  },
});

// Default export for Expo Router
export default function ChartComponentsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 20 }}>
      <BarChart
        title="Sample Bar Chart"
        data={[
          { label: 'Q1', value: 120, color: '#FF6B6B' },
          { label: 'Q2', value: 98, color: '#4ECDC4' },
          { label: 'Q3', value: 86, color: '#45B7D1' },
          { label: 'Q4', value: 110, color: '#96CEB4' },
        ]}
      />
      
      <LineChart
        title="Sample Line Chart"
        data={[
          { label: 'Jan', value: 65 },
          { label: 'Feb', value: 78 },
          { label: 'Mar', value: 90 },
          { label: 'Apr', value: 81 },
          { label: 'May', value: 95 },
        ]}
        color="#667eea"
      />
      
      <PieChart
        title="Sample Pie Chart"
        data={[
          { label: 'Desktop', value: 60, color: '#FF6B6B' },
          { label: 'Mobile', value: 30, color: '#4ECDC4' },
          { label: 'Tablet', value: 10, color: '#45B7D1' },
        ]}
      />
      
      <ProgressBar
        label="Project Progress"
        value={75}
        maxValue={100}
        color="#4ECDC4"
      />
    </View>
  );
}