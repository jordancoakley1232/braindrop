import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  Modal,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  ScrollView,
  Platform,
} from "react-native"; // Add to your imports
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRef, useState } from "react";
import { Picker } from "@react-native-picker/picker";
type AdvancedFilterModalPropsType = {
  showFilterModal: boolean;
  setShowFilterModal: (show: boolean) => void;
  filterFields: {
    date: string | null; // Use string for date in ISO format or undefined
    type: string;
    title: string;
    description: string;
    tags: string[];
  };
  setFilterFields: (fields: (prev: any) => any) => void;
};

export const AdvancedFilterModal = ({
  showFilterModal,
  setShowFilterModal,
  filterFields,
  setFilterFields,
}: AdvancedFilterModalPropsType) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newTag, setNewTag] = useState("");
  const tagInputRef = useRef<TextInput>(null);

  const onDateFilterChange = (
    event: DateTimePickerEvent,
    date?: Date | undefined
  ) => {
    console.log(event);
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      setFilterFields((f: any) => ({
        ...f,
        date: null,
      }));
      return;
    }
    setShowDatePicker(Platform.OS === "ios"); // iOS keeps the picker visible
    if (date) {
      const formattedDate = date.toISOString() as any;
      setFilterFields((f: any) => ({
        ...f,
        date: formattedDate,
      }));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null; // Handle empty date string
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !filterFields.tags.includes(trimmedTag)) {
      setFilterFields((f: any) => ({
        ...f,
        tags: [...f.tags, trimmedTag],
      }));
      setNewTag("");
      // Refocus the input for quick entry
      setTimeout(() => {
        tagInputRef.current?.focus();
      }, 100);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFilterFields((f: any) => ({
      ...f,
      tags: f.tags.filter((tag: string) => tag !== tagToRemove),
    }));
  };

  const onCancel = () => {
    setShowFilterModal(false);
    setFilterFields((f: any) => ({
      ...f,
      date: null,
      type: "",
      title: "",
      description: "",
      tags: [],
    }));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.centeredView}>
        <Modal
          visible={showFilterModal}
          animationType="slide"
          //   presentationStyle="pageSheet"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Advanced Filters</Text>
            <TouchableOpacity onPress={() => {}} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <TextInput
                  placeholder="Date (MMM DD, YYYY)"
                  style={styles.textInput}
                  editable={false}
                  pointerEvents="none" // Prevents keyboard from appearing
                  value={formatDate(filterFields.date) as string}
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={
                    filterFields.date ? new Date(filterFields.date) : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={onDateFilterChange}
                />
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Type</Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  borderRadius: 12,
                  backgroundColor: "#FFFFFF",
                  overflow: "hidden",
                }}
              >
                <Picker
                  selectedValue={filterFields.type}
                  onValueChange={(type) =>
                    setFilterFields((f) => ({ ...f, type }))
                  }
                  style={{ minHeight: 48 }}
                  dropdownIconColor="#6B7280"
                >
                  <Picker.Item label="All Types" value="" />
                  <Picker.Item label="Text" value="text" />
                  <Picker.Item label="Voice" value="voice" />
                  <Picker.Item label="Image" value="image" />
                </Picker>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Title</Text>
              <TextInput
                placeholder="Enter title"
                style={styles.textInput}
                value={filterFields.title}
                onChangeText={(title) =>
                  setFilterFields((f) => ({ ...f, title }))
                }
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <TextInput
                placeholder="Enter description"
                style={styles.textInput}
                value={filterFields.description}
                onChangeText={(description) =>
                  setFilterFields((f) => ({ ...f, description }))
                }
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagInput}>
                <FontAwesome name="tags" size={20} color="#6B7280" />
                <TextInput
                  ref={tagInputRef}
                  style={styles.tagTextInput}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Tags"
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
              {filterFields?.tags.length > 0 && (
                <View style={styles.tagList}>
                  {filterFields?.tags.map((tag, index) => (
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
            <TouchableOpacity style={styles.favoriteButton} onPress={onCancel}>
              <Text style={[styles.favoriteButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={() => {}}>
              <Text style={styles.saveButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  sortButton: {
    marginLeft: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  sortButtonText: {
    marginLeft: 6,
    color: "#3B82F6",
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterList: {
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  clearFiltersButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  advancedFilterButton: {
    position: "absolute",
    bottom: 32,
    right: 32,
    backgroundColor: "#3B82F6",
    borderRadius: 32,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: 20,
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
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    minHeight: 48,
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
});
