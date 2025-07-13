import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../ui/card';
import {
  Copy,
  Download,
  Loader2,
  BarChart2,
  Edit,
  Trash2,
  FileImage,
  MessageSquare,
  Hash,
  MapPin,
} from 'lucide-react-native';
import QRCodeGenerator from '../QRCodeGenerator';
import * as Clipboard from 'expo-clipboard';
import toast from '../../lib/toast';
import { createPageUrlWithSlash } from '../../utils';

interface EventEntity {
  id: string | number
  name: string
  code?: string
  location?: string
  starts_at?: string
  expires_at?: string
}

interface AdminEventCardProps {
  event: EventEntity;
  isDownloading: boolean;
  onAnalytics: (event: EventEntity) => void;
  onFeedbacks: (event: EventEntity) => void;
  onEdit: (event: EventEntity) => void;
  onDownload: (event: EventEntity) => void;
  onDelete: (event: EventEntity) => void;
}

const APP_ORIGIN = 'https://example.com';

export default function AdminEventCard({
  event,
  isDownloading,
  onAnalytics,
  onFeedbacks,
  onEdit,
  onDownload,
  onDelete,
}: AdminEventCardProps) {
  const now = new Date();
  const isActive =
    !!event.starts_at &&
    !!event.expires_at &&
    new Date(event.starts_at) <= now &&
    now <= new Date(event.expires_at);

  const joinUrl = `${APP_ORIGIN}${createPageUrlWithSlash(`join?code=${event.code?.toUpperCase() || ''}`)}`;

  const handleCopyLink = () => {
    Clipboard.setStringAsync(joinUrl);
    toast({ type: 'success', text1: 'Join link copied to clipboard!' });
  };

  return (
    <Card style={styles.eventCard}>
      <CardHeader style={styles.eventHeader}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <CardTitle>
              <Text style={styles.eventName}>{event.name}</Text>
            </CardTitle>
            <View style={styles.codeRow}>
              <View style={styles.codeItem}>
                <Hash size={14} color="#fff" />
                <Text style={styles.codeText}>{event.code?.toUpperCase() || 'No Code'}</Text>
              </View>
              {event.location ? (
                <View style={styles.codeItem}>
                  <MapPin size={14} color="#fff" />
                  <Text style={styles.codeText}>{event.location}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <Badge style={isActive ? styles.activeBadge : styles.inactiveBadge}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </View>
      </CardHeader>
      <CardContent>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <Text style={styles.sectionText}>
            Starts: {event.starts_at ? new Date(event.starts_at).toLocaleString() : 'Not set'}
          </Text>
          <Text style={styles.sectionText}>
            Expires: {event.expires_at ? new Date(event.expires_at).toLocaleString() : 'Not set'}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join Link</Text>
          <View style={styles.linkRow}>
            <Input
              value={joinUrl}
              editable={false}
              style={styles.linkInput}
            />
            <Button
              variant="outline"
              size="icon"
              onPress={handleCopyLink}
            >
              <Copy size={16} />
            </Button>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QR Code</Text>
          <QRCodeGenerator
            url={joinUrl}
            fileName={`${event.name}_QR.png`}
          />
        </View>
      </CardContent>
      <CardFooter style={styles.footer}>
        <Button variant="outline" onPress={() => onAnalytics(event)} style={styles.actionButton}>
          <BarChart2 size={14} style={styles.icon} />
          <Text style={styles.actionText}>Analytics</Text>
        </Button>
        <Button variant="outline" onPress={() => onFeedbacks(event)} style={styles.actionButton}>
          <MessageSquare size={14} style={styles.icon} />
          <Text style={styles.actionText}>Feedbacks</Text>
        </Button>
        <Button variant="outline" onPress={() => onEdit(event)} style={styles.actionButton}>
          <Edit size={14} style={styles.icon} />
          <Text style={styles.actionText}>Edit</Text>
        </Button>
        <Button onPress={() => onDownload(event)} disabled={isDownloading} style={styles.actionButton}>
          {isDownloading ? (
            <Loader2 size={14} style={styles.icon} />
          ) : (
            <Download size={14} style={styles.icon} />
          )}
          <Text style={styles.actionText}>Download</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => toast({ type: 'info', text1: 'Coming soon!' })}
          style={styles.actionButton}
        >
          <FileImage size={14} style={styles.icon} />
          <Text style={styles.actionText}>QR Sign</Text>
        </Button>
        <Button variant="destructive" onPress={() => onDelete(event)} style={styles.actionButton}>
          <Trash2 size={14} style={styles.icon} />
          <Text style={styles.actionText}>Delete</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}

const styles = StyleSheet.create({
  eventCard: { marginBottom: 16 },
  eventHeader: { backgroundColor: '#3b82f6', padding: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'flex-start' },
  eventName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  codeRow: { flexDirection: 'row', gap: 8 },
  codeItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  codeText: { color: '#e0e7ff', fontSize: 12 },
  activeBadge: { backgroundColor: '#10b981', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  inactiveBadge: { backgroundColor: '#6b7280', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  section: { marginBottom: 12 },
  sectionTitle: { fontWeight: '600', marginBottom: 4, color: '#111827' },
  sectionText: { fontSize: 12, color: '#6b7280' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkInput: { flex: 1 },
  footer: { flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: 4, color: '#111827' },
  icon: { marginRight: 2 },
}); 