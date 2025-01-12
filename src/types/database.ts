export interface ClassificationData {
    id: string;
    classification: 'Healthy' | 'Unhealthy';
    created_at: string; // Ensure this matches your table's schema
    image_url: string;
    location: string;
  }

  export  interface ProfileData {
    id: string;
    email: string | undefined;
    created_at: string;
  }

export interface ChartDataMap {
    [date: string]: { date: string; 
    Healthy: number;
    Unhealthy: number };
}