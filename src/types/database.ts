export interface ClassificationData {
    result: string;
    confidence: string;
    id: string;
    classification: 'Healthy' | 'Unhealthy';
    created_at: string; // Ensure this matches your table's schema
    image_url: string;
    location: string;
  }

  // export  interface ProfileData {
  //   id: string;
  //   email: string | undefined;
  //   created_at: string;
  // }

  export interface ProfileData {
    id: string; // UUID
    email: string | undefined; // from auth.users
    phone?: string;
    address?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string | null;
    updated_at?: string;
  }
  

export interface ChartDataMap {
    [date: string]: { date: string; 
    Healthy: number;
    Unhealthy: number };
}