import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { STORAGE_KEY, useIdeas } from "@/hooks/useIdeas";
import { CaptureModal } from "@/components/CaptureModal";
import { QuickCaptureButton } from "@/components/QuickCaptureButton";
import { Idea } from "@/types/idea";
import { useFocusEffect } from "@react-navigation/native";
import CaptureTest from "@/components/CaptureTest";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CaptureScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [ideaType, setIdeaType] = useState<"text" | "voice" | "image">("text");
  const { ideas, addIdea, loading, refreshIdeas } = useIdeas();
  useFocusEffect(
    React.useCallback(() => {
      refreshIdeas();
    }, [])
  );

  const handleSaveIdea = async (ideaData: any) => {
    try {
      await addIdea(ideaData);
      await refreshIdeas();
    } catch (error) {
      console.error("Error saving ideas:", error);
    }
  };

  const getTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayIdeas = ideas.filter((idea) => {
      const ideaDate = new Date(idea.createdAt);
      ideaDate.setHours(0, 0, 0, 0);
      return ideaDate.getTime() === today.getTime();
    });

    return {
      today: todayIdeas.length,
      total: ideas.length,
      favorites: ideas.filter((idea) => idea.isFavorite).length,
    };
  };

  const stats = getTodayStats();

  const toggleCaptureModal = (type: "text" | "voice" | "image") => {
    setIdeaType(type);
    setModalVisible(true);
    // Additional logic can be added here based on the type of capture
    // For example, if type is "voice", you might want to start a voice recording
    // or if type is "image", you might want to open the image picker.
  };

  const quickActions = [
    {
      title: "Quick Text",
      subtitle: "Capture a thought",
      icon: "zap",
      color: "#3B82F6",
      onPress: () => toggleCaptureModal("text"),
    },
    {
      title: "Voice Note",
      subtitle: "Record your ideas",
      icon: "mic",
      color: "#10B981",
      onPress: () => toggleCaptureModal("voice"),
    },
    {
      title: "Image Idea",
      subtitle: "Visual inspiration",
      icon: "image",
      color: "#F59E0B",
      onPress: () => toggleCaptureModal("image"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F0F9FF", "#E0F2FE"]} style={styles.gradient}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Ready to capture?</Text>
            <Text style={styles.subtitle}>
              Your ideas are waiting to be discovered
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              {loading ? (
                <ActivityIndicator size="large" color="#3B82F6" />
              ) : (
                <>
                  <Text style={styles.statNumber}>{stats.today}</Text>
                  <Text style={styles.statLabel}>Ideas Today</Text>
                </>
              )}
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Ideas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.favorites}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>

          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionCard}
                  onPress={action.onPress}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: action.color },
                    ]}
                  >
                    <Feather
                      name={action.icon as any}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.quickActionText}>
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionSubtitle}>
                      {action.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.sectionTitle}>💡 ADHD-Friendly Tips</Text>
            <View style={styles.tipCard}>
              <Feather name="target" size={20} color="#3B82F6" />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Capture Everything</Text>
                <Text style={styles.tipText}>
                  Don't filter your thoughts - capture them all. You can
                  organize later.
                </Text>
              </View>
            </View>
            <View style={styles.tipCard}>
              <Feather name="star" size={20} color="#10B981" />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Use Tags</Text>
                <Text style={styles.tipText}>
                  Tag your ideas with context, mood, or project to find them
                  easily.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <QuickCaptureButton onPress={() => setModalVisible(true)} />

        {modalVisible && (
          <CaptureModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            ideaType={ideaType}
            onSave={handleSaveIdea}
          />
        )}
        {/* <CaptureTest /> */}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  quickActions: {
    gap: 12,
  },
  quickActionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  tipsContainer: {
    marginBottom: 100,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
});
