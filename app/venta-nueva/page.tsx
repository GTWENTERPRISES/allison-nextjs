"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Trash2 } from "lucide-react";

// Definir el esquema de validación
const formSchema = z.object({
  producto: z.string().min(1, "Seleccione un producto"),
  cantidad: z.string().min(1, "Ingrese una cantidad"),
});

// Interfaces para tipado
interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
}

interface VentaItem {
  producto: number;
  cantidad: number;
  precio_venta: number;
  subtotal: number;
}

export default function NuevaVenta() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<VentaItem[]>([]);

  // Fetch de productos
  useEffect(() => {
    async function fetchProductos() {
      try {
        const response = await axios.get('http://localhost:8000/api/productos/');
        setProductos(response.data);
        setIsLoading(false);
      } catch (error) {
        toast.error("Error al cargar productos");
        setIsLoading(false);
      }
    }
    fetchProductos();
  }, []);

  // Configuración del formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      producto: "",
      cantidad: "",
    },
  });

  // Función para agregar item a la venta
  function onSubmit(values: z.infer<typeof formSchema>) {
    const producto = productos.find((p) => p.id === parseInt(values.producto));
    if (!producto) return;

    const cantidad = parseInt(values.cantidad);

    // Verificar stock disponible
    if (cantidad > producto.stock) {
      toast.error(`Stock insuficiente. Stock disponible: ${producto.stock}`);
      return;
    }

    // Verificar si el producto ya está en la lista
    const itemExistente = items.find(item => item.producto === producto.id);
    if (itemExistente) {
      toast.error("El producto ya está en la lista. Elimínelo y vuelva a agregarlo.");
      return;
    }

    const nuevoItem: VentaItem = {
      producto: producto.id,
      cantidad,
      precio_venta: producto.precio,
      subtotal: producto.precio * cantidad,
    };

    setItems([...items, nuevoItem]);
    form.reset();
  }

  // Función para eliminar un item
  function eliminarItem(index: number) {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
  }

  // Función para finalizar la venta
  async function finalizarVenta() {
    if (items.length === 0) {
      toast.error("Agregue al menos un producto");
      return;
    }

    try {
      // Enviar la venta a la API de Django
      const response = await axios.post('http://localhost:8000/api/ventas/', {
        items: items.map(item => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precio_venta: item.precio_venta,
        })),
      });

      toast.success("Venta registrada con éxito");
      router.push("/ventas");
    } catch (error: any) {
      // Manejo de errores de la API
      if (error.response) {
        toast.error(error.response.data.detail || "Error al procesar la venta");
      } else if (error.request) {
        toast.error("No se pudo conectar con el servidor");
      } else {
        toast.error("Error al procesar la venta");
      }
    }
  }

  // Calcular total
  const total = items.reduce((acc, item) => acc + item.subtotal, 0);

  // Estado de carga
  if (isLoading) return <div>Cargando...</ div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Nueva Venta</h1>

      <div className="grid gap-8">
        {/* Formulario para agregar productos */}
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Campo de Producto */}
                <FormField
                  control={form.control}
                  name="producto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Producto</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productos.map((producto) => (
                            <SelectItem 
                              key={producto.id} 
                              value={producto.id.toString()}
                              disabled={producto.stock === 0}
                            >
                              {producto.nombre} - ${producto.precio} 
                              {` (Stock: ${producto.stock})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Campo de Cantidad */}
                <FormField
                  control={form.control}
                  name="cantidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="Cantidad" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Agregar a la venta
              </Button>
            </form>
          </Form>
        </Card>

        {/* Resumen de Venta */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de venta</h2>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay productos agregados
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const producto = productos.find((p) => p.id === item.producto);
                return (
                  <div 
                    key={index} 
                    className="flex justify-between items-center">
                    <div>
                      <span>{producto?.nombre} x {item.cantidad}</span>
                    </div>
                    <div>
                      <span>${item.subtotal}</span>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => eliminarItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
          )}
          <Button onClick={finalizarVenta} className="w-full mt-4">
            Finalizar Venta
          </Button>
        </Card>
      </div>
    </div>
  );
}