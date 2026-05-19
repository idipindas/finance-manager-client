import api from "./axios";
import type { Category } from "@/types";

export const getCategories = () =>
  api.get<{ success: boolean; data: Category[] }>("/categories").then((r) => r.data.data);

export const suggestCategory = (name: string) =>
  api
    .post<{ success: boolean; data: Category; isNew: boolean }>("/categories/suggest", { name })
    .then((r) => r.data);
