import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardActionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardHeader, style]}>
      {children}
    </View>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({ children, style }) => {
  return (
    <Text style={[styles.cardTitle, style]}>
      {children}
    </Text>
  );
};

const CardDescription: React.FC<CardDescriptionProps> = ({ children, style }) => {
  return (
    <Text style={[styles.cardDescription, style]}>
      {children}
    </Text>
  );
};

const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardContent, style]}>
      {children}
    </View>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardFooter, style]}>
      {children}
    </View>
  );
};

const CardAction: React.FC<CardActionProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardAction, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cardFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAction: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
});

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
export default Card;
