import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Donut Chart Component
interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  title: string;
  centerText?: string;
}

export function DonutChart({ data, title, centerText }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 70;
  const innerRadius = 40;
  const centerX = radius;
  const centerY = radius;

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.donutContainer}>
        <View style={[styles.donutChart, { width: radius * 2, height: radius * 2 }]}>
          {/* Outer circle segments */}
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            return (
              <View
                key={index}
                style={[
                  styles.donutSegment,
                  {
                    backgroundColor: item.color,
                    width: radius * 2,
                    height: radius * 2,
                    borderRadius: radius,
                  },
                ]}
              />
            );
          })}
          
          {/* Inner circle */}
          <View style={[
            styles.donutInner,
            {
              width: innerRadius * 2,
              height: innerRadius * 2,
              borderRadius: innerRadius,
              top: radius - innerRadius,
              left: radius - innerRadius,
            }
          ]}>
            {centerText && (
              <Text style={styles.donutCenterText}>{centerText}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.donutLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.label}: {((item.value / total) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Horizontal Bar Chart
interface HorizontalBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title: string;
  maxValue?: number;
}

export function HorizontalBarChart({ data, title, maxValue }: HorizontalBarChartProps) {
  const chartWidth = screenWidth - 100;
  const maxVal = maxValue || Math.max(...data.map(d => d.value));

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.horizontalBarsContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.horizontalBarRow}>
            <Text style={styles.horizontalBarLabel}>{item.label}</Text>
            <View style={styles.horizontalBarTrack}>
              <View
                style={[
                  styles.horizontalBar,
                  {
                    width: maxVal > 0 ? `${(item.value / maxVal) * 100}%` : '0%',
                    backgroundColor: item.color || '#667eea',
                  },
                ]}
              />
              <Text style={styles.horizontalBarValue}>{item.value.toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Area Chart Component
interface AreaChartProps {
  data: Array<{ label: string; value: number }>;
  title: string;
  color?: string;
}

export function AreaChart({ data, title, color = '#667eea' }: AreaChartProps) {
  const chartWidth = screenWidth - 60;
  const chartHeight = 200;
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((item.value - minValue) / range) * chartHeight;
    return { x, y, value: item.value, label: item.label };
  });

  // Create path for area fill
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ` L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={[styles.areaChartContainer, { width: chartWidth, height: chartHeight }]}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <View
            key={index}
            style={[
              styles.gridLine,
              { top: ratio * chartHeight, width: chartWidth }
            ]}
          />
        ))}
        
        {/* Area fill */}
        <View
          style={[
            styles.areaFill,
            {
              backgroundColor: color + '30', // Add transparency
              width: chartWidth,
              height: chartHeight,
            }
          ]}
        />
        
        {/* Line and points */}
        {points.map((point, index) => (
          <View key={index}>
            {/* Line to next point */}
            {index < points.length - 1 && (
              <View
                style={[
                  styles.areaLine,
                  {
                    position: 'absolute',
                    left: point.x,
                    top: point.y,
                    width: Math.sqrt(
                      Math.pow(points[index + 1].x - point.x, 2) +
                      Math.pow(points[index + 1].y - point.y, 2)
                    ),
                    height: 2,
                    backgroundColor: color,
                    transformOrigin: '0 50%',
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
            )}
            
            {/* Data point */}
            <View
              style={[
                styles.areaPoint,
                {
                  position: 'absolute',
                  left: point.x - 3,
                  top: point.y - 3,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        ))}
        
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, minValue].map((value, index) => (
            <Text
              key={index}
              style={[
                styles.yAxisLabel,
                { top: (index / 4) * chartHeight - 8 }
              ]}
            >
              {Math.round(value).toLocaleString()}
            </Text>
          ))}
        </View>
        
        {/* X-axis labels */}
        <View style={styles.xAxisLabels}>
          {points.map((point, index) => (
            <Text
              key={index}
              style={[
                styles.xAxisLabel,
                { left: point.x - 20, top: chartHeight + 5 }
              ]}
            >
              {point.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

// Default export for Expo Router
export default function AdvancedChartsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <DonutChart
        title="Sample Donut Chart"
        data={[
          { label: 'Category A', value: 30, color: '#FF6B6B' },
          { label: 'Category B', value: 45, color: '#4ECDC4' },
          { label: 'Category C', value: 25, color: '#45B7D1' },
        ]}
        centerText="100%"
      />
      
      <HorizontalBarChart
        title="Sample Bar Chart"
        data={[
          { label: 'Item 1', value: 120, color: '#FF6B6B' },
          { label: 'Item 2', value: 98, color: '#4ECDC4' },
          { label: 'Item 3', value: 86, color: '#45B7D1' },
        ]}
      />
      
      <AreaChart
        title="Sample Area Chart"
        data={[
          { label: 'Jan', value: 65 },
          { label: 'Feb', value: 78 },
          { label: 'Mar', value: 90 },
          { label: 'Apr', value: 81 },
          { label: 'May', value: 95 },
        ]}
        color="#667eea"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  // Donut Chart Styles
  donutContainer: {
    alignItems: 'center',
  },
  donutChart: {
    position: 'relative',
    marginBottom: 20,
  },
  donutSegment: {
    position: 'absolute',
  },
  donutInner: {
    position: 'absolute',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutCenterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  donutLegend: {
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Horizontal Bar Chart Styles
  horizontalBarsContainer: {
    paddingVertical: 10,
  },
  horizontalBarRow: {
    marginVertical: 8,
  },
  horizontalBarLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  horizontalBarTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    height: 24,
    position: 'relative',
  },
  horizontalBar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  horizontalBarValue: {
    position: 'absolute',
    right: 8,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  // Area Chart Styles
  areaChartContainer: {
    position: 'relative',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  areaFill: {
    position: 'absolute',
    bottom: 0,
  },
  areaLine: {
    position: 'absolute',
  },
  areaPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#fff',
  },
  yAxisLabels: {
    position: 'absolute',
    left: -40,
    top: 0,
    height: '100%',
  },
  yAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
    width: 35,
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: -25,
    left: 0,
    width: '100%',
    height: 20,
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    width: 40,
  },
});