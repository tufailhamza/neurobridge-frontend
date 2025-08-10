export interface FeedCard {
  id: string;
  image_url: string;
  title: string;
  user_id: string;
  user_name: string;
  date: string;
  read_time: string;
  tags: string[];
  price: number;
  html_content: string;
  allow_comments: boolean;
  tier: string | null;
  collection: string | null;
  attachments: string[];
  date_published: string;
} 