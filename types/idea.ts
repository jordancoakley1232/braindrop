export interface Idea {
  id: string;
  type: "text" | "voice" | "image";
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  uri?: string; // For image/voice files
}

export interface IdeaFilter {
  type?: "text" | "voice" | "image";
  tags?: string[];
  favorites?: boolean;
  searchQuery?: string;
}
