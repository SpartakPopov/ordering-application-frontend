import { useState, useEffect } from 'react';
import { fetchMenu, fetchCategories } from '../api/menuApi';

export function useMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchMenu(), fetchCategories()])
      .then(([items, cats]) => {
        setMenuItems(items);
        setCategories(cats);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { menuItems, categories, loading, error };
}
