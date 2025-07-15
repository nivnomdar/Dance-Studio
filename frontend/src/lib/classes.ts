import { Class } from '../types/class';
import { apiService } from './api';
import { TIMEOUTS } from '../utils/constants';

export const classesService = {
  // Get all active classes with retry logic
  async getAllClasses(): Promise<Class[]> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const data = await apiService.classes.getAll();
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // If it's a rate limit error and we have retries left, wait and retry
        if (lastError.message.includes('429') && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // For other errors or last attempt, throw immediately
        break;
      }
    }
    
    throw new Error(`Failed to fetch classes after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  },

  // Get class by ID with retry logic
  async getClassById(id: string): Promise<Class | null> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const data = await apiService.classes.getById(id);
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (lastError.message.includes('429') && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt + 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }
    
    throw new Error(`Failed to fetch class after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  },

  // Get class by slug with retry logic
  async getClassBySlug(slug: string): Promise<Class | null> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const data = await apiService.classes.getBySlug(slug);
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (lastError.message.includes('429') && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt + 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }
    
    throw new Error(`Failed to fetch class after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }
}; 