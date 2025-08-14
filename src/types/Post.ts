export interface Post {
  id: number;
  title: string;
  collection: string | null;
  access: 'public' | 'paid';
  price: number;
  date_published: string;
  user_id: number;
  image_url?: string;
  html_content?: string;
  tags?: string[];
  allow_comments?: boolean;
  tier?: string;
  attachments?: string[];
}

export interface PostResponse {
  id: number;
  title: string;
  collection: string | null;
  access: 'public' | 'paid';
  price: number;
  date_published: string;
  user_id: number;
  image_url?: string;
  html_content?: string;
  tags?: string[];
  allow_comments?: boolean;
  tier?: string;
  attachments?: string[];
}
