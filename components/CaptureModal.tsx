import React, { useState } from 'react';
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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Type, Mic, Image as ImageIcon, X, Hash, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Idea } from '@/types/idea';

interface CaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingIdea?: Idea;
}

export function CaptureModal({ visible, onClose, onSave, editingIdea }: CaptureModalProps) {
  const [type, setType] = useState<'text' | 'voice' | 'image'>(editingIdea?.type || 'text');
  const [title, setTitle] = useState(editingIdea?.title || '');
  const [content, setContent] = useState(editingIdea?.content || '');
  const [tags, setTags] = useState<string[]>(editingIdea?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isFavorite, setIsFavorite] = useState(editingIdea?.isFavorite || false);
  const [imageUri, setImageUri] = useState(editingIdea?.uri || '');

  const resetForm = () => {
    if (!editingIdea) {
      setType('text');
      setTitle('');
      setContent('');
      setTags([]);
      setNewTag('');
      setIsFavorite(false);
      setImageUri('');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your idea');
      return;
    }

    if (type === 'text' && !content.trim()) {
      Alert.alert('Error', 'Please enter some content for your text idea');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const ideaData: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'> = {
      type,
      title: title.trim(),
      content: content.trim(),
      tags,
      isFavorite,
      uri: imageUri || undefined,
    };

    onSave(ideaData);
    handleClose();
  };

  const handleTypeChange = (newType: 'text' | 'voice' | 'image') => {
    setType(newType);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
          setTitle('Image Idea');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const renderTypeSelector = () => (
    <View style={styles.typeSelector}>
      <Text style={styles.sectionTitle}>Type</Text>
      <View style={styles.typeButtons}>
        {[
          { type: 'text' as const, icon: Type, label: 'Text' },
          { type: 'voice' as const, icon: Mic, label: 'Voice' },
          { type: 'image' as const, icon: ImageIcon, label: 'Image' },
        ].map(({ type: itemType, icon: Icon, label }) => (
          <TouchableOpacity
            key={itemType}
            style={[
              styles.typeButton,
              type === itemType && styles.typeButtonActive,
            ]}
            onPress={() => handleTypeChange(itemType)}
          >
            <Icon
              size={20}
              color={type === itemType ? '#FFFFFF' : '#6B7280'}
            />
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
      case 'text':
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
      case 'voice':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Note</Text>
            <TouchableOpacity style={styles.voiceButton}>
              <Mic size={24} color="#3B82F6" />
              <Text style={styles.voiceButtonText}>Tap to record</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>Voice recording not available in web preview</Text>
          </View>
        );
      case 'image':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Image</Text>
            <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
              <ImageIcon size={24} color="#3B82F6" />
              <Text style={styles.imageButtonText}>
                {imageUri ? 'Change Image' : 'Select Image'}
              </Text>
            </TouchableOpacity>
            {imageUri && (
              <Text style={styles.helperText}>Image selected</Text>
            )}
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <BlurView intensity={100} style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingIdea ? 'Edit Idea' : 'Capture Idea'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                <Hash size={20} color="#6B7280" />
                <TextInput
                  style={styles.tagTextInput}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add a tag"
                  returnKeyType="done"
                  onSubmitEditing={handleAddTag}
                />
                {newTag.trim() && (
                  <TouchableOpacity onPress={handleAddTag} style={styles.addTagButton}>
                    <Check size={16} color="#3B82F6" />
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
                      <X size={14} color="#0891B2" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
                {isFavorite ? '♥ Favorite' : '♡ Add to Favorites'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingIdea ? 'Update' : 'Save Idea'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
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
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  typeSelector: {
    marginBottom: 24,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    gap: 12,
  },
  voiceButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    gap: 12,
  },
  imageButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  tagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#0891B2',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  favoriteButton: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  favoriteButtonActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  favoriteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  favoriteButtonTextActive: {
    color: '#EF4444',
  },
  saveButton: {
    padding: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});