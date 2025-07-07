import { Registration, RegistrationWithDetails, CreateRegistrationRequest } from '../types/registration';
import { apiService } from './api';

export const registrationsService = {
  // Get all registrations (admin only)
  async getAllRegistrations(): Promise<RegistrationWithDetails[]> {
    try {
      const data = await apiService.registrations.getAll();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch registrations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get user's own registrations
  async getMyRegistrations(): Promise<RegistrationWithDetails[]> {
    try {
      const data = await apiService.registrations.getMy();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch my registrations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get registration by ID
  async getRegistrationById(id: string): Promise<RegistrationWithDetails | null> {
    try {
      const data = await apiService.registrations.getById(id);
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Create new registration
  async createRegistration(data: CreateRegistrationRequest): Promise<RegistrationWithDetails> {
    try {
      const result = await apiService.registrations.create(data);
      return result;
    } catch (error) {
      throw new Error(`Failed to create registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Update registration status (admin only)
  async updateRegistrationStatus(id: string, status: string): Promise<RegistrationWithDetails> {
    try {
      const data = await apiService.registrations.updateStatus(id, status);
      return data;
    } catch (error) {
      throw new Error(`Failed to update registration status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Delete registration
  async deleteRegistration(id: string): Promise<{ message: string }> {
    try {
      const result = await apiService.registrations.delete(id);
      return result;
    } catch (error) {
      throw new Error(`Failed to delete registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}; 