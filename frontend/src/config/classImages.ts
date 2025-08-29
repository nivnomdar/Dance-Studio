// Class Images Configuration
// תמונות השיעורים מ-Supabase bucket: classes/images/v1

export interface ClassImage {
  id: string;
  name: string;
  url: string;
  description: string;
  category?: string;
}

export const CLASS_IMAGES: ClassImage[] = [
  {
    id: 'blue',
    name: 'כחול',
    url: 'https://login.ladances.com/storage/v1/object/public/classes/images/v1/blue.png',
    description: 'תמונה כחולה לשיעורים',
    category: 'cool'
  },
  {
    id: 'green',
    name: 'ירוק',
    url: 'https://login.ladances.com/storage/v1/object/public/classes/images/v1/green.png',
    description: 'תמונה ירוקה לשיעורים',
    category: 'cool'
  },
  {
    id: 'orange',
    name: 'כתום',
    url: 'https://login.ladances.com/storage/v1/object/public/classes/images/v1/orange.png',
    description: 'תמונה כתומה לשיעורים',
    category: 'warm'
  },
  {
    id: 'pink',
    name: 'ורוד',
    url: 'https://login.ladances.com/storage/v1/object/public/classes/images/v1/pink.png',
    description: 'תמונה ורודה לשיעורים',
    category: 'warm'
  },
  {
    id: 'purple',
    name: 'סגול',
    url: 'https://login.ladances.com/storage/v1/object/public/classes/images/v1/purple.png',
    description: 'תמונה סגולה לשיעורים',
    category: 'cool'
  },
  {
    id: 'red',
    name: 'אדום',
    url: 'https://login.ladances.com/storage/v1/object/public/classes/images/v1/red.png',
    description: 'תמונה אדומה לשיעורים',
    category: 'warm'
  },
  {
    id: 'yellow',
    name: 'צהוב',
    url: 'https://login.ladances.com/storage/v1/object/public/classes/images/v1/yellow.png',
    description: 'תמונה צהובה לשיעורים',
    category: 'warm'
  }
];

// Helper function to get image by ID
export const getClassImageById = (id: string): ClassImage | undefined => {
  return CLASS_IMAGES.find(img => img.id === id);
};

// Helper function to get default image
export const getDefaultClassImage = (): ClassImage => {
  return CLASS_IMAGES[0]; // blue as default
};

// Helper function to get images by category
export const getClassImagesByCategory = (category: string): ClassImage[] => {
  return CLASS_IMAGES.filter(img => img.category === category);
};

// Helper function to get all image URLs
export const getAllClassImageUrls = (): string[] => {
  return CLASS_IMAGES.map(img => img.url);
};
