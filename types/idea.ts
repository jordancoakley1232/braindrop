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
  recordingUri?: string; // For voice ideas, stores the recorded audio file URI
  description?: string; // For image ideas, can be used for additional context
}

export interface IdeaFilter {
  type?: "text" | "voice" | "image";
  tags?: string[];
  favorites?: boolean;
  searchQuery?: string;
}

export type IdeaType = "text" | "voice" | "image";
