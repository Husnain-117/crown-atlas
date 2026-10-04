export interface BlogPost {
  _id?: string;
  title: string;
  summary: string;
  tags: string[];
  content: string;
  imageUrl: string;
  schema_markup?: any;
  status: 'draft' | 'published';
  featured: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  category?: string;
  city?: string;
  topic?: string;
  keyword?: string;
  groupId?: string;
  language?: string;
  readingTime?: number; // in minutes
  editorial?: {
    status: 'draft' | 'published';
    generated_at: string;
    review_required: boolean;
    reviewed_by: string | null;
    reviewed_at: string | null;
    sources: { url: string; note: string }[];
  };
  author?: {
    name: string;
    organization: string;
  };
}

export interface BlogGenerationParams {
  topic: string;
  keyword: string;
  city?: string;
  category?: string;
  groupId?: string;
}










