import { ClassType } from '../types/class';

// Class type constants
export const CLASS_TYPES: Record<ClassType, string> = {
  group: 'קבוצתי',
  private: 'פרטי',
  zoom: 'זום',
  workshop: 'סדנה',
  intensive: 'אינטנסיב'
};

export const CLASS_TYPE_COLORS: Record<ClassType, string> = {
  group: 'bg-blue-100 text-blue-800',
  private: 'bg-purple-100 text-purple-800',
  zoom: 'bg-green-100 text-green-800',
  workshop: 'bg-orange-100 text-orange-800',
  intensive: 'bg-red-100 text-red-800'
};

// Helper functions
export const getClassTypeLabel = (classType: ClassType): string => {
  return CLASS_TYPES[classType] || classType;
};

export const getClassTypeColor = (classType: ClassType): string => {
  return CLASS_TYPE_COLORS[classType] || 'bg-gray-100 text-gray-800';
};

export const isValidClassType = (classType: string): classType is ClassType => {
  return Object.keys(CLASS_TYPES).includes(classType);
};

export const getAvailableClassTypes = (): ClassType[] => {
  return Object.keys(CLASS_TYPES) as ClassType[];
}; 