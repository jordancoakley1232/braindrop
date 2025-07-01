import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Idea, IdeaFilter } from '@/types/idea';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'braindrop_ideas';

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedIdeas = JSON.parse(stored).map((idea: any) => ({
          ...idea,
          createdAt: new Date(idea.createdAt),
          updatedAt: new Date(idea.updatedAt),
        }));
        setIdeas(parsedIdeas);
      }
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveIdeas = async (newIdeas: Idea[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newIdeas));
      setIdeas(newIdeas);
    } catch (error) {
      console.error('Error saving ideas:', error);
    }
  };

  const addIdea = async (ideaData: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIdea: Idea = {
      ...ideaData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedIdeas = [newIdea, ...ideas];
    await saveIdeas(updatedIdeas);
    return newIdea;
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    const updatedIdeas = ideas.map(idea =>
      idea.id === id
        ? { ...idea, ...updates, updatedAt: new Date() }
        : idea
    );
    await saveIdeas(updatedIdeas);
  };

  const deleteIdea = async (id: string) => {
    const updatedIdeas = ideas.filter(idea => idea.id !== id);
    await saveIdeas(updatedIdeas);
  };

  const toggleFavorite = async (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (idea) {
      await updateIdea(id, { isFavorite: !idea.isFavorite });
    }
  };

  const filterIdeas = (filter: IdeaFilter) => {
    return ideas.filter(idea => {
      if (filter.type && idea.type !== filter.type) return false;
      if (filter.favorites && !idea.isFavorite) return false;
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some(tag => idea.tags.includes(tag));
        if (!hasTag) return false;
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const matchesTitle = idea.title.toLowerCase().includes(query);
        const matchesContent = idea.content.toLowerCase().includes(query);
        const matchesTags = idea.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesContent && !matchesTags) return false;
      }
      return true;
    });
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    ideas.forEach(idea => {
      idea.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  return {
    ideas,
    loading,
    addIdea,
    updateIdea,
    deleteIdea,
    toggleFavorite,
    filterIdeas,
    getAllTags,
    refreshIdeas: loadIdeas,
  };
}