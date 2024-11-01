export interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
  timestamp?: string;
}

export interface ApiSuccessResponse {
  result: string;
}