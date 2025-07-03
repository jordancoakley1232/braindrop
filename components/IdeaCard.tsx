import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from "react-native";
import { Idea } from "@/types/idea";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";

interface IdeaCardProps {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function IdeaCard({
  idea,
  onEdit,
  onDelete,
  onToggleFavorite,
}: IdeaCardProps) {
  const scaleValue = useSharedValue(1);
  const favoriteScale = useSharedValue(1);
  console.log(idea.createdAt);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const favoriteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favoriteScale.value }],
  }));

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1);
  };

  const handleFavorite = () => {
    favoriteScale.value = withSpring(1.2, {}, () => {
      favoriteScale.value = withSpring(1);
    });
    onToggleFavorite(idea.id);
  };

  const handleDelete = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this idea?")) {
        onDelete(idea.id);
      }
    } else {
      Alert.alert("Delete Idea", "Are you sure you want to delete this idea?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(idea.id),
        },
      ]);
    }
  };

  const getTypeIcon = () => {
    switch (idea.type) {
      case "text":
        return <Feather name="type" size={16} color="#6B7280" />;
      case "voice":
        return <Feather name="mic" size={16} color="#6B7280" />;
      case "image":
        return <Feather name="image" size={16} color="#6B7280" />;
    }
  };

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const renderIdeaCard = () => {
    if (idea.type === "text") {
      return (
        <Text style={styles.content} numberOfLines={2}>
          {idea.content}
        </Text>
      );
    }
    if (idea.type === "image" && idea.uri) {
      return (
        <View
          style={{
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            columnGap: 8,
          }}
        >
          <Image
            source={{ uri: idea.uri }}
            style={{ width: 40, height: 40, borderRadius: 12 }}
            resizeMode="cover"
          />
          {idea.description ? (
            <Text
              style={[styles.content, { flex: 1 }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {idea.description}
            </Text>
          ) : null}
        </View>
      );
    }
    if (idea.type === "voice" && idea.description) {
      return (
        <View
          style={{
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            columnGap: 8,
          }}
        >
          {idea.description ? (
            <Text
              style={[styles.content, { flex: 1 }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {idea.description}
            </Text>
          ) : null}
        </View>
      );
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onEdit(idea)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            {getTypeIcon()}
            <Text style={styles.title} numberOfLines={1}>
              {idea.title}
            </Text>
          </View>
          <View style={styles.actions}>
            <Animated.View style={favoriteAnimatedStyle}>
              <TouchableOpacity
                onPress={handleFavorite}
                style={styles.actionButton}
              >
                <Feather
                  name="heart"
                  size={20}
                  color={idea.isFavorite ? "#EF4444" : "#6B7280"}
                  fill={idea.isFavorite ? "#EF4444" : "none"}
                />
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.actionButton}
            >
              <Feather name="trash" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        {renderIdeaCard()}
        <View style={styles.footer}>
          <View style={styles.tags}>
            {idea.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {idea.tags.length > 3 && (
              <Text style={styles.moreText}>+{idea.tags.length - 3}</Text>
            )}
          </View>
          {/* <Text style={styles.date}>{formatDate(idea.createdAt)}</Text> */}
          <Text style={styles.date}>{formatDate(idea.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tag: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#0891B2",
    fontWeight: "500",
  },
  moreText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
