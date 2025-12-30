import axios from "axios";
import type { PaginatedResponse, Recipe } from "./types";

export type SearchFilters = {
  title?: string;
  cuisine?: string;
  rating?: string;     // e.g. ">=4.5"
  total_time?: string; // e.g. "<=60"
  calories?: string;   // e.g. "<=400"
};

export async function fetchRecipes(page: number, limit: number) {
  const res = await axios.get<PaginatedResponse<Recipe>>("/api/recipes", {
    params: { page, limit },
  });
  return res.data;
}

export async function searchRecipes(filters: SearchFilters, page: number, limit: number) {
  const params: Record<string, string | number> = { page, limit };

  // Only send non-empty filters
  for (const [k, v] of Object.entries(filters)) {
    if (v && v.trim().length > 0) params[k] = v.trim();
  }

  const res = await axios.get<PaginatedResponse<Recipe>>("/api/recipes/search", { params });
  return res.data;
}
