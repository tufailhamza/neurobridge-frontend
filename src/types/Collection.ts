export interface Collection {
  collection_id: number;
  user_id: number;
  name: string;
  created_at: string;
  post_count?: number; // Optional field for the number of posts in the collection
}