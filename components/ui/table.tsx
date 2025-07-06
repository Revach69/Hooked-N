import React from 'react';
import { View, Text, ViewProps, TextProps, ScrollView } from 'react-native';

const Table = React.forwardRef<View, ViewProps>(({ style, children, ...props }, ref) => (
  <ScrollView horizontal style={{ width: '100%' }} contentContainerStyle={{ flexGrow: 1 }}>
    <View ref={ref} style={style} {...props}>{children}</View>
  </ScrollView>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={style} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={style} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={style} {...props} />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={style} {...props} />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref} style={style} {...props} />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref} style={style} {...props} />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref} style={style} {...props} />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};