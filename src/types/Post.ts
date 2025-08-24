export interface Post {
  id: string; // Changed from number to string (UUID from backend)
  title: string;
  collection: string | null;
  access?: 'public' | 'paid';
  tier?: 'public' | 'paid' | 'free';
  price: number;
  date_published: string;
  user_id: number;
  user_name?: string; // Added from backend
  image_url?: string;
  html_content?: string;
  tags?: string[];
  allow_comments?: boolean;
  attachments?: string[];
  read_time?: string; // Added from backend
  date?: string; // Added from backend
  stripe_price_id?: string; // Added from backend
  stripe_product_id?: string; // Added from backend
  is_scheduled?: boolean; // Added for scheduled posts
  scheduled_date?: string; // Added for scheduled posts
}

export interface PostResponse {
  id: string; // Changed from number to string (UUID from backend)
  title: string;
  collection: string | null;
  access?: 'public' | 'paid';
  tier?: 'public' | 'paid' | 'free';
  price: number;
  date_published: string;
  user_id: number;
  user_name?: string; // Added from backend
  image_url?: string;
  html_content?: string;
  tags?: string[];
  allow_comments?: boolean;
  attachments?: string[];
  read_time?: string; // Added from backend
  date?: string; // Added from backend
  stripe_price_id?: string; // Added from backend
  stripe_product_id?: string; // Added from backend
  is_scheduled?: boolean; // Added for scheduled posts
  scheduled_date?: string; // Added for scheduled posts
}
