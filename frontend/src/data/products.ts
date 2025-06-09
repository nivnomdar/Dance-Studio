import { Product } from '../types/product';

export const products: Product[] = [
  {
    id: 1,
    name: 'נעלי עקב מקצועיות - קולקציית פרימיום',
    description: 'נעלי עקב מקצועיות לריקוד, עם תמיכה מיטבית ונוחות מרבית. מתאימות לשיעורים והופעות.',
    price: 599,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000',
    category: 'shoes',
    features: [
      'סוליה גמישה במיוחד',
      'תמיכה מיטבית בכף הרגל',
      'חומרים נושמים',
      'עיצוב מודרני',
      'זמינות במידות 36-42'
    ],
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    colors: ['שחור', 'לבן', 'אדום'],
    inStock: true,
    rating: 4.8,
    reviews: {
      count: 124,
      comments: [
        {
          user: 'שירה כהן',
          rating: 5,
          comment: 'הנעליים הכי נוחות שיש לי! מושלמות לשיעורים.',
          date: '2024-03-15'
        },
        {
          user: 'מיכל לוי',
          rating: 4,
          comment: 'איכות מעולה, רק צריך להתרגל למידה.',
          date: '2024-03-10'
        }
      ]
    },
    isNew: true,
    isBestSeller: true
  },
  {
    id: 2,
    name: 'תיק אימונים מקצועי',
    description: 'תיק אימונים מרווח עם תאים ייעודיים לנעליים ובגדים. כולל כיס מבודד לשתייה.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000',
    category: 'accessories',
    features: [
      'תאים מרובים',
      'כיס מבודד לשתייה',
      'רצועות נוחות',
      'חומרים עמידים',
      'ניקוי קל'
    ],
    colors: ['שחור', 'אפור', 'ורוד'],
    inStock: true,
    rating: 4.6,
    reviews: {
      count: 89,
      comments: [
        {
          user: 'דנה ישראלי',
          rating: 5,
          comment: 'תיק מעולה! מתאים בדיוק לכל הציוד שלי.',
          date: '2024-03-12'
        },
        {
          user: 'יעל דוד',
          rating: 4,
          comment: 'איכות טובה, רק היה יכול להיות קצת יותר גדול.',
          date: '2024-03-08'
        }
      ]
    },
    isNew: false,
    isBestSeller: false
  },
  {
    id: 3,
    name: 'גרביונים מקצועיים - קולקציית פרימיום',
    description: 'גרביונים מקצועיים לריקוד, עם תמיכה מיטבית ונוחות מרבית. מתאימים לאימונים והופעות.',
    price: 199,
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=1000',
    category: 'clothing',
    features: [
      'חומרים נושמים',
      'תמיכה מיטבית',
      'עיצוב מודרני',
      'זמינות במידות S-XXL',
      'ניקוי קל'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['שחור', 'לבן', 'ורוד'],
    inStock: true,
    rating: 4.9,
    reviews: {
      count: 156,
      comments: [
        {
          user: 'ליאת כהן',
          rating: 5,
          comment: 'הגרביונים הכי נוחים שיש לי! מושלמים לשיעורים.',
          date: '2024-03-14'
        },
        {
          user: 'מיכל לוי',
          rating: 5,
          comment: 'איכות מעולה, נוחים מאוד.',
          date: '2024-03-09'
        }
      ]
    },
    isNew: true,
    isBestSeller: true
  },
  {
    id: 4,
    name: 'חליפת אימונים מקצועית',
    description: 'חליפת אימונים מקצועית לריקוד, עם תמיכה מיטבית ונוחות מרבית. מתאימה לאימונים והופעות.',
    price: 399,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
    category: 'clothing',
    features: [
      'חומרים נושמים',
      'תמיכה מיטבית',
      'עיצוב מודרני',
      'זמינות במידות S-XXL',
      'ניקוי קל'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['שחור', 'לבן', 'ורוד'],
    inStock: true,
    rating: 4.7,
    reviews: {
      count: 78,
      comments: [
        {
          user: 'נועה ישראלי',
          rating: 5,
          comment: 'חליפה מעולה! נוחה מאוד לשיעורים.',
          date: '2024-03-13'
        },
        {
          user: 'דנה דוד',
          rating: 4,
          comment: 'איכות טובה, רק היה יכול להיות קצת יותר מרווח.',
          date: '2024-03-07'
        }
      ]
    },
    isNew: false,
    isBestSeller: false
  }
]; 