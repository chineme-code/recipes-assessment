export type Nutrients = Record<string, string> | null;

export type Recipe = {
  id: number;
  title: string | null;
  cuisine: string | null;
  rating: number | null;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  description: string | null;
  nutrients: Nutrients;
  serves: string | null;
};

export type PaginatedResponse<T> = {
  page: number;
  limit: number;
  total: number;
  data: T[];
};
