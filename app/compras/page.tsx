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
import { useState } from "react";
import { useProductos } from "@/hooks/useProductos";
import { createCompra } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
  producto: z.string().min(1, "Seleccione un producto"),
  cantidad: z.string().min(1, "Ingrese una cantidad"),
  precioCompra: z.string().min(1, "Ingrese el precio de compra"),
});

interface CompraItem {
  producto: string;
  cantidad: number;
  precioCompra: number;
  subtotal: number;
}

export default function NuevaCompra() {
  const router = useRouter();
  const { productos, isLoading, mutate } = useProductos();
  const [items, setItems] = useState<CompraItem[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      producto: "",
      cantidad: "",
      precioCompra: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const producto = productos.find((p: any) => p.id === values.producto);
    if (!producto) return;

    const cantidad = parseInt(values.cantidad);
    const precioCompra = parseFloat(values.precioCompra);
    const nuevoItem: CompraItem = {
      producto: producto.id,
      cantidad,
      precioCompra,
      subtotal: precioCompra * cantidad,
    };

    setItems([...items, nuevoItem]);
    form.reset();
  }

  async function finalizarCompra() {
    if (items.length === 0) {
      toast.error("Agregue al menos un producto");
      return;
    }

    try {
      await createCompra({
        items: items.map(item => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precio_compra: item.precioCompra,
        })),
      });

      toast.success("Compra registrada con éxito");
      mutate(); // Actualizar el inventario
      router.push("/inventario");
    } catch (error) {
      toast.error("Error al procesar la compra");
    }
  }

  const total = items.reduce((acc, item) => acc + item.subtotal, 0);

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Nueva Compra</h1>

      <div className="grid gap-8">
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
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
                          {productos.map((producto: any) => (
                            <SelectItem key={producto.id} value={producto.id}>
                              {producto.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

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

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de compra</h2>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay productos agregados
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const producto = productos.find((p: any) => p.id === item.producto);
                return (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{producto?.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.cantidad} x ${item.precioCompra}
                      </p>
                    </div>
                    <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={finalizarCompra}
              disabled={items.length === 0}
            >
              Finalizar Compra
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}