import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardContent } from './ui/card';
import { LucideIcon } from 'lucide-react-native';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = '#ec4899',
}: StatsCardProps) {
  return (
    <Card style={styles.card}>
      <CardContent style={styles.cardContent}>
        <View style={styles.header}>
          {Icon && <Icon size={20} color={color} style={styles.icon} />}
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <Text style={[styles.value, { color }]}>{value}</Text>
        
        {trend && (
          <View style={styles.trendContainer}>
            <Text style={[
              styles.trendValue,
              { color: trend.isPositive ? '#10b981' : '#ef4444' }
            ]}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Text>
            <Text style={styles.trendLabel}>from last period</Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  trendLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
}); 