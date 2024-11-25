import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVentas } from "@/hooks/useVentas";
import { DollarSign, Package, TrendingUp } from "lucide-react";

export function DashboardStats() {
  const { ventas, isLoading } = useVentas();

  if (isLoading) {
    return <div>Cargando estadísticas...</div>;
  }

  // Calcular estadísticas
  const ventasHoy = ventas?.filter((venta: any) => {
    const fecha = new Date(venta.fecha);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  });

  const totalVentasHoy = ventasHoy?.reduce((acc: number, venta: any) => acc + venta.total, 0) || 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalVentasHoy.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {ventasHoy?.length || 0} transacciones
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {ventasHoy?.reduce((acc: number, venta: any) => 
              acc + venta.items.reduce((itemAcc: number, item: any) => itemAcc + item.cantidad, 0)
            , 0) || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Hoy
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12.5%</div>
          <p className="text-xs text-muted-foreground">
            Comparado con ayer
          </p>
        </CardContent>
      </Card>
    </div>
  );
}