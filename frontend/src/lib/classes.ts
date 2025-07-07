import { Class } from '../types/class';
import { apiService } from './api';

export const classesService = {
  // Get all active classes
  async getAllClasses(): Promise<Class[]> {
    try {
      const data = await apiService.classes.getAll();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch classes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get class by ID
  async getClassById(id: string): Promise<Class | null> {
    try {
      const data = await apiService.classes.getById(id);
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch class: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get class by slug
  async getClassBySlug(slug: string): Promise<Class | null> {
    try {
      const data = await apiService.classes.getBySlug(slug);
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch class: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}; 