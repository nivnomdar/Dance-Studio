import { Class } from '../types/class';
import { apiService } from './api';

export const classesService = {
  // Get all active classes
  async getAllClasses(): Promise<Class[]> {
    return apiService.classes.getAll();
  },

  // Get class by ID
  async getClassById(id: string): Promise<Class | null> {
    return apiService.classes.getById(id);
  },

  // Get class by slug
  async getClassBySlug(slug: string): Promise<Class | null> {
    return apiService.classes.getBySlug(slug);
  }
}; 