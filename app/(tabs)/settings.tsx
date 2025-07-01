import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useIdeas } from '@/hooks/useIdeas';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { ideas, refreshIdeas } = useIdeas();

  const handleExportData = async () => {
    try {
      const data = JSON.stringify(ideas, null, 2);
      // In a real app, you would use a file system API to save this
      Alert.alert('Export Data', `Your data is ready to export:\n\n${data.substring(0, 200)}...`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all your ideas? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('braindrop_ideas');
              await refreshIdeas();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const settingsGroups = [
    {
      title: 'Data Management',
      items: [
        {
          icon: 'download',
          title: 'Export Data',
          subtitle: 'Download your ideas as JSON',
          onPress: handleExportData,
        },
        {
          icon: 'upload',
          title: 'Import Data',
          subtitle: 'Restore ideas from backup',
          onPress: () => Alert.alert('Coming Soon', 'Import feature will be available in a future update'),
        },
        {
          icon: 'trash',
          title: 'Clear All Data',
          subtitle: 'Delete all your ideas',
          onPress: handleClearAllData,
          danger: true,
        },
      ],
    },
    {
      title: 'App Info',
      items: [
        {
          icon: 'info',
          title: 'About',
          subtitle: 'Learn more about Braindrop',
          onPress: () => {},
        },
        {
          icon: 'heart',
          title: 'Support',
          subtitle: 'Support the project',
          onPress: () => {},
        },
        {
          icon: 'zap',
          title: 'Pro Features',
          subtitle: 'Unlock more features',
          onPress: () => {},
        },
        {
          icon: 'shield',
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          onPress: () => {},
        },
        {
          icon: 'help-circle',
          title: 'Help',
          subtitle: 'Get help and support',
          onPress: () => Alert.alert('Help & Feedback', 'Contact support at help@braindrop.app'),
        },
      ],
    },
  ];

  const stats = {
    totalIdeas: ideas.length,
    textIdeas: ideas.filter(idea => idea.type === 'text').length,
    voiceIdeas: ideas.filter(idea => idea.type === 'voice').length,
    imageIdeas: ideas.filter(idea => idea.type === 'image').length,
    favorites: ideas.filter(idea => idea.isFavorite).length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your BrainDrop experience</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalIdeas}</Text>
              <Text style={styles.statLabel}>Total Ideas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.textIdeas}</Text>
              <Text style={styles.statLabel}>Text</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.voiceIdeas}</Text>
              <Text style={styles.statLabel}>Voice</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.imageIdeas}</Text>
              <Text style={styles.statLabel}>Images</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.favorites}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        </View>

        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupItems}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingsItem,
                    itemIndex === group.items.length - 1 && styles.settingsItemLast,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={[
                    styles.settingsItemIcon,
                    item.danger && styles.settingsItemIconDanger,
                  ]}>
                    <Feather
                      name={item.icon as any}
                      size={20}
                      color={item.danger ? '#EF4444' : '#6B7280'}
                    />
                  </View>
                  <View style={styles.settingsItemContent}>
                    <Text style={[
                      styles.settingsItemTitle,
                      item.danger && styles.settingsItemTitleDanger,
                    ]}>
                      {item.title}
                    </Text>
                    <Text style={styles.settingsItemSubtitle}>
                      {item.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            BrainDrop is designed to help you capture and organize your ideas effortlessly.
          </Text>
          <Text style={styles.footerText}>
            All your data is stored locally and never leaves your device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  groupItems: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemLast: {
    borderBottomWidth: 0,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsItemIconDanger: {
    backgroundColor: '#FEF2F2',
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingsItemTitleDanger: {
    color: '#EF4444',
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
});