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

// Definir el esquema de validación
const formSchema = z.object({
  producto: z.string().min(1, "Seleccione un producto"),
  cantidad: z.string().min(1, "Ingrese una cantidad"),
  precioCompra: z.string().min(1, "Ingrese el precio de compra"),
});

// Interfaces para tipado
interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  stock: number;
}

interface CompraItem {
  producto: number;
  cantidad: number;
  precio_compra: number;
  subtotal: number;
}

export default function NuevaCompra() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<CompraItem[]>([]);
  
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
      precioCompra: "",
    },
  });

  // Función para agregar item a la compra
  function onSubmit(values: z.infer<typeof formSchema>) {
    const producto = productos.find((p) => p.id === parseInt(values.producto));
    if (!producto) return;

    const cantidad = parseInt(values.cantidad);
    const precioCompra = parseFloat(values.precioCompra);
    const nuevoItem: CompraItem = {
      producto: producto.id,
      cantidad,
      precio_compra: precioCompra,
      subtotal: precioCompra * cantidad,
    };

    setItems([...items, nuevoItem]);
    form.reset();
  }

  // Función para finalizar la compra
  async function finalizarCompra() {
    if (items.length === 0) {
      toast.error("Agregue al menos un producto");
      return;
    }

    try {
      // Enviar la compra a la API de Django
      const response = await axios.post('http://localhost:8000/api/compras/', {
        items: items.map(item => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precio_compra: item.precio_compra,
        })),
      });

      toast.success("Compra registrada con éxito");
      router.push("/inventario");
    } catch (error: any) {
      // Manejo de errores de la API
      if (error.response) {
        // La solicitud fue hecha y el servidor respondió con un código de estado
        // que cae fuera del rango de 2xx
        toast.error(error.response.data.detail || "Error al procesar la compra");
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        toast.error("No se pudo conectar con el servidor");
      } else {
        // Algo sucedió al configurar la solicitud que provocó un error
        toast.error("Error al procesar la compra");
      }
    }
  }

  // Calcular total
  const total = items.reduce((acc, item) => acc + item.subtotal, 0);

  // Estado de carga
  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Nueva Compra</h1>

      <div className="grid gap-8">
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
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
                            >
                              {producto.nombre}
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
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Campo de Precio de Compra */}
                <FormField
                  control={form.control}
                  name="precioCompra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio de Compra</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Agregar a la compra
              </Button>
            </form>
          </Form>
        </Card>

        {/* Resumen de Compra */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de compra</h2>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay productos agregados
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const producto = productos.find((p) => p.id === item.producto);
                return (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      
                      <span>{producto?.nombre} x {item.cantidad}</span>
                    </div>
                    <div>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}
          <Button onClick={finalizarCompra} className="w-full mt-4">
            Finalizar Compra
          </Button>
        </Card>
      </div>
    </div>
  );
}