export async function logActivity(actionType: string, details?: string, metadata?: Record<string, unknown>, accessToken?: string, severityLevel: 'info' | 'warn' | 'error' = 'info'): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/activity-log`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ actionType, details, metadata, severityLevel }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to log activity: Status ${response.status}, Details: ${errorText}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending activity log:', error);
    return false;
  }
}
