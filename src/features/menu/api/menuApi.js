import { API_BASE } from '../../../config/api';

export async function fetchMenu() {
  const res = await fetch(`${API_BASE}/menu`);
  if (!res.ok) throw new Error('Failed to fetch menu items');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}
