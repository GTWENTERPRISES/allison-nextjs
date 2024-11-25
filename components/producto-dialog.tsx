// components/producto-dialog.tsx
"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProducto, updateProducto } from '@/hooks/useProductos';

interface ProductoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto?: any;
  onSuccess: () => void;
}

export function ProductoDialog({ 
  open, 
  onOpenChange, 
  producto, 
  onSuccess 
}: ProductoDialogProps) {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    precio: '',
    stock: 0
  });

  // Efecto para actualizar el estado del formulario cuando se selecciona un producto para editar
  useEffect(() => {
    if (producto) {
      setFormData({
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: producto.precio,
        stock: producto.stock
      });
    } else {
      setFormData({
        codigo: '',
        nombre: '',
        precio: '',
        stock: 0
      });
    }
  }, [producto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (producto) {
        // Actualizar producto existente
        await updateProducto(producto.id, formData);
      } else {
        // Crear nuevo producto
        await createProducto(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      // Manejar errores (puedes agregar un toast o mensaje de error)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Código</Label>
            <Input
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Precio</Label>
            <Input
              name="precio"
              type="number"
              step="0.01"
              value={formData.precio}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Stock</Label>
            <Input
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">
              {producto ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}