import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  FontAwesome,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Idea, IdeaType } from "@/types/idea";
import { Audio } from "expo-av";
import { AUDIO_RECORDING_OPTIONS } from "./constants";

interface CaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (idea: Omit<Idea, "id" | "createdAt" | "updatedAt">) => void;
  editingIdea?: Idea;
  ideaType?: IdeaType;
}

export function CaptureModal({
  visible,
  onClose,
  onSave,
  editingIdea,
  ideaType = "text",
}: CaptureModalProps) {
  const [type, setType] = useState<"text" | "voice" | "image">(
    editingIdea?.type || ideaType
  );
  const [title, setTitle] = useState(editingIdea?.title || "");
  const [content, setContent] = useState(editingIdea?.content || "");
  const [description, setDescription] = useState(
    editingIdea?.description || ""
  );
  // Use content for text, description for image
  const [tags, setTags] = useState<string[]>(editingIdea?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isFavorite, setIsFavorite] = useState(
    editingIdea?.isFavorite || false
  );
  const [imageUri, setImageUri] = useState(editingIdea?.uri || "");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState(
    editingIdea?.recordingUri || ""
  );
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const tagInputRef = useRef<TextInput>(null);

  const resetForm = () => {
    if (!editingIdea) {
      setType("text");
      setTitle("");
      setContent("");
      setTags([]);
      setNewTag("");
      setIsFavorite(false);
      setImageUri("");
      setDescription("");
      setRecordedUri("");
      setRecording(null);
      setSound(null);
      setIsRecording(false);
      setIsPlaying(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your idea");
      return;
    }

    if (type === "text" && !content.trim()) {
      Alert.alert("Error", "Please enter some content for your text idea");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const ideaData: Idea = {
      type,
      title: title.trim(),
      content: type === "voice" ? "" : content.trim(),
      tags,
      isFavorite,
      uri: imageUri || undefined,
      recordingUri: type === "voice" ? recordedUri : undefined,
      description:
        type === "image" || type === "voice" ? description.trim() : undefined,
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString() as any,
      updatedAt: new Date().toISOString() as any,
    };

    onSave(ideaData);
    handleClose();
  };

  const handleTypeChange = (newType: "text" | "voice" | "image") => {
    setType(newType);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag("");
      // Refocus the input for quick entry
      setTimeout(() => {
        tagInputRef.current?.focus();
      }, 100);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        if (!title) {
          setTitle("Image Idea");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please grant audio recording permission."
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(AUDIO_RECORDING_OPTIONS);
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
    } catch (err) {
      Alert.alert("Recording error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri || "");
      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      Alert.alert("Recording error", "Could not stop recording.");
    }
  };

  const playRecording = async () => {
    if (!recordedUri) return;
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: recordedUri,
      });
      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || status.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch (err) {
      Alert.alert("Playback error", "Could not play recording.");
      setIsPlaying(false);
    }
  };

  const renderTypeSelector = () => (
    <View style={styles.typeSelector}>
      <Text style={styles.sectionTitle}>Type</Text>
      <View style={styles.typeButtons}>
        {[
          { type: "text" as const, icon: Feather, label: "Text" },
          { type: "voice" as const, icon: Feather, label: "Voice" },
          { type: "image" as const, icon: Feather, label: "Image" },
        ].map(({ type: itemType, icon: Icon, label }) => (
          <TouchableOpacity
            key={itemType}
            style={[
              styles.typeButton,
              type === itemType && styles.typeButtonActive,
            ]}
            onPress={() => handleTypeChange(itemType)}
          >
            {itemType === "text" && (
              <Feather
                name="type"
                size={20}
                color={type === itemType ? "#FFFFFF" : "#6B7280"}
              />
            )}
            {itemType === "voice" && (
              <Feather
                name="mic"
                size={20}
                color={type === itemType ? "#FFFFFF" : "#6B7280"}
              />
            )}
            {itemType === "image" && (
              <Feather
                name="image"
                size={20}
                color={type === itemType ? "#FFFFFF" : "#6B7280"}
              />
            )}
            <Text
              style={[
                styles.typeButtonText,
                type === itemType && styles.typeButtonTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderContentInput = () => {
    switch (type) {
      case "text":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content</Text>
            <TextInput
              style={styles.textArea}
              value={content}
              onChangeText={setContent}
              placeholder="What's your idea?"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        );
      case "voice":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Note</Text>
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <MaterialCommunityIcons
                name={isRecording ? "stop" : "microphone"}
                size={24}
                color="#3B82F6"
              />
              <Text style={styles.voiceButtonText}>
                {isRecording
                  ? "Stop Recording"
                  : recordedUri
                  ? "Re-record"
                  : "Tap to record"}
              </Text>
            </TouchableOpacity>
            {recordedUri && (
              <>
                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    {
                      marginTop: 12,
                      backgroundColor: "#E0E7FF",
                      borderColor: "#6366F1",
                    },
                  ]}
                  onPress={playRecording}
                  disabled={isPlaying}
                >
                  <MaterialCommunityIcons
                    name={isPlaying ? "pause" : "play"}
                    size={24}
                    color="#6366F1"
                  />
                  <Text style={[styles.voiceButtonText, { color: "#6366F1" }]}>
                    {isPlaying ? "Playing..." : "Play Recording"}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>Voice note recorded!</Text>
              </>
            )}
            <View style={styles.section}>
              {/* Add a text box here to caputre the recording description */}
              <Text style={styles.sectionTitle}>Description</Text>
              <TextInput
                style={[styles.textInput, { minHeight: 100 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Description"
                returnKeyType="done"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        );
      case "image":
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Image</Text>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handleImagePicker}
              >
                {imageUri ? (
                  <>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <Text style={styles.imageButtonText}>
                      {imageUri ? "Change Image" : "Select Image"}
                    </Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="image" size={24} color="#3B82F6" />
                    <Text style={styles.imageButtonText}>
                      {imageUri ? "Change Image" : "Select Image"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            {imageUri && <Text style={styles.helperText}>Image selected</Text>}

            <View style={styles.section}>
              {/* Add a text box here to caputre the image description */}
              <Text style={styles.sectionTitle}>Description</Text>
              <TextInput
                style={[styles.textInput, { minHeight: 100 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Description"
                returnKeyType="done"
                multiline
                textAlignVertical="top"
              />
            </View>
          </>
        );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.centeredView}>
        <Modal
          visible={visible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingIdea ? "Edit Idea" : "Capture Idea"}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {renderTypeSelector()}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Give your idea a title"
                returnKeyType="next"
              />
            </View>

            {renderContentInput()}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagInput}>
                <FontAwesome name="tags" size={20} color="#6B7280" />
                <TextInput
                  ref={tagInputRef}
                  style={styles.tagTextInput}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add a tag"
                  returnKeyType="done"
                  onSubmitEditing={handleAddTag}
                />
                {newTag.trim() && (
                  <TouchableOpacity
                    onPress={handleAddTag}
                    style={styles.addTagButton}
                  >
                    <Feather name="check" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                )}
              </View>
              {tags.length > 0 && (
                <View style={styles.tagList}>
                  {tags.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.tag}
                      onPress={() => handleRemoveTag(tag)}
                    >
                      <Text style={styles.tagText}>#{tag}</Text>
                      <Feather name="x" size={14} color="#0891B2" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.favoriteButton,
                isFavorite && styles.favoriteButtonActive,
              ]}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Text
                style={[
                  styles.favoriteButtonText,
                  isFavorite && styles.favoriteButtonTextActive,
                ]}
              >
                {isFavorite ? "♥ Favorite" : "♡ Add to Favorites"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingIdea ? "Update" : "Save Idea"}
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  typeSelector: {
    marginBottom: 24,
  },
  typeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  typeButtonTextActive: {
    color: "#FFFFFF",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    minHeight: 48,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    minHeight: 100,
  },
  voiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#BAE6FD",
    borderStyle: "dashed",
    gap: 12,
  },
  voiceButtonText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "500",
  },
  imageButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#BAE6FD",
    borderStyle: "dashed",
    gap: 12,
  },
  imageButtonText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "500",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginLeft: 12,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  tagInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  tagTextInput: {
    flex: 1,
    fontSize: 16,
  },
  addTagButton: {
    padding: 4,
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: "#0891B2",
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  favoriteButton: {
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  favoriteButtonActive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  favoriteButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  favoriteButtonTextActive: {
    color: "#EF4444",
  },
  saveButton: {
    padding: 16,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
