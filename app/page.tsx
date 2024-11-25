import { DashboardStats } from "@/components/dashboard-stats";
import { RecentSales } from "@/components/recent-sales";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <Link href="/venta-nueva">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Venta
          </Button>
        </Link>
      </div>
      
      <DashboardStats />
      <RecentSales />
    </div>
  );
}