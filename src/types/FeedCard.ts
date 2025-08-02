export interface FeedCard {
  id: string;
  imageUrl: string;
  title: string;
  doctor: {
    name: string;
    designation: string;
    profileIcon: string;
  };
  date: string;
  readTime: string;
  tags: string[];
  price: number;
  imageColor: string;
  htmlContent: string;
} 