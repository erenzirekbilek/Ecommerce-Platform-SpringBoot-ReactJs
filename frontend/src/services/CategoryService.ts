import axios from "axios";

export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: number | null;
  color?: string;
  icon?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const getCategories = async (): Promise<CategoryDTO[]> => {
  const res = await axios.get<CategoryDTO[]>(`${API_URL}/categories`);
  return res.data;
};
