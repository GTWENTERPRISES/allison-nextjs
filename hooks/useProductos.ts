"use client";

import useSWR from 'swr';
import { getProductos } from '@/lib/api';

export function useProductos() {
  const { data, error, isLoading, mutate } = useSWR('productos', getProductos);

  return {
    productos: data,
    isLoading,
    isError: error,
    mutate,
  };
}