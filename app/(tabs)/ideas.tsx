import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useIdeas } from '@/hooks/useIdeas';
import { IdeaCard } from '@/components/IdeaCard';
import { CaptureModal } from '@/components/CaptureModal';
import { Idea, IdeaFilter } from '@/types/idea';
import { useFocusEffect } from '@react-navigation/native';

export default function IdeasScreen() {
  const { ideas, loading, updateIdea, deleteIdea, toggleFavorite, refreshIdeas } = useIdeas();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<IdeaFilter>({});
  const [editingIdea, setEditingIdea] = useState<Idea | undefined>();
  const [showEditModal, setShowEditModal] = useState(false);

    useFocusEffect(
    React.useCallback(() => {
      refreshIdeas();
    }, [])
  );


  const filteredIdeas = useMemo(() => {
    let filtered = ideas;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(query) ||
        idea.content.toLowerCase().includes(query) ||
        idea.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedFilter.type) {
      filtered = filtered.filter(idea => idea.type === selectedFilter.type);
    }

    if (selectedFilter.favorites) {
      filtered = filtered.filter(idea => idea.isFavorite);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [ideas, searchQuery, selectedFilter]);

  const handleEditIdea = (idea: Idea) => {
    setEditingIdea(idea);
    setShowEditModal(true);
  };

  const handleUpdateIdea = async (ideaData: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingIdea) {
      await updateIdea(editingIdea.id, ideaData);
      setEditingIdea(undefined);
      setShowEditModal(false);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    await deleteIdea(id);
  };

  const clearFilters = () => {
    setSelectedFilter({});
    setSearchQuery('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedFilter.type) count++;
    if (selectedFilter.favorites) count++;
    return count;
  };

  const filterOptions = [
    { key: 'all', label: 'All', icon: undefined },
    { key: 'text', label: 'Text', icon: 'type' },
    { key: 'voice', label: 'Voice', icon: 'mic' },
    { key: 'image', label: 'Image', icon: 'image' },
    { key: 'favorites', label: 'Favorites', icon: 'heart' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your ideas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Ideas</Text>
        <Text style={styles.subtitle}>
          {filteredIdeas.length} of {ideas.length} ideas
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ideas, tags, or content..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = 
              item.key === 'all' ? !selectedFilter.type && !selectedFilter.favorites :
              item.key === 'favorites' ? selectedFilter.favorites :
              selectedFilter.type === item.key;

            return (
              <TouchableOpacity
                style={[styles.filterButton, isActive && styles.filterButtonActive]}
                onPress={() => {
                  if (item.key === 'all') {
                    setSelectedFilter({});
                  } else if (item.key === 'favorites') {
                    setSelectedFilter({ favorites: !selectedFilter.favorites });
                  } else {
                    setSelectedFilter({ type: item.key as 'text' | 'voice' | 'image' });
                  }
                }}
              >
                {item.icon && (
                  <Feather
                    name={item.icon as any}
                    size={16}
                    color={isActive ? '#FFFFFF' : '#6B7280'}
                  />
                )}
                <Text
                  style={[
                    styles.filterButtonText,
                    isActive && styles.filterButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
        {getActiveFiltersCount() > 0 && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredIdeas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {searchQuery || getActiveFiltersCount() > 0 ? 'No ideas found' : 'No ideas yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery || getActiveFiltersCount() > 0
              ? 'Try adjusting your search or filters'
              : 'Start capturing your ideas to see them here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredIdeas}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <IdeaCard
              idea={item}
              onEdit={handleEditIdea}
              onDelete={handleDeleteIdea}
              onToggleFavorite={toggleFavorite}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      {showEditModal && editingIdea && (
      <CaptureModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingIdea(undefined);
        }}
        onSave={handleUpdateIdea}
        editingIdea={editingIdea}
      />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterList: {
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  clearFiltersButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});