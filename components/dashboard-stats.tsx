"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Venta {
  id: string;
  fecha: string;
  total: number;
  items: Array<{
    cantidad: number;
    producto: string;
    precio: number;
  }>;
}

export function DashboardStats() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get<Venta[]>('http://localhost:8000/api/ventas');
        setVentas(response.data);
        setLoading(false);
      } catch (err) {
        setError('No se pudieron cargar las ventas');
        setLoading(false);
      }
    };

    fetchVentas();
  }, []);

  const calcularEstadisticas = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const ventasHoy = ventas.filter(venta => 
      venta.fecha.split('T')[0] === hoy
    );

    const ventasAyer = ventas.filter(venta => 
      venta.fecha.split('T')[0] === ayer
    );

    // Suma correcta de ventas como números
    const totalVentas = ventasHoy.reduce((acc, venta) => {
      return acc + Number(venta.total);
    }, 0);

    const totalProductos = ventasHoy.reduce((acc, venta) => 
      acc + venta.items.reduce((itemAcc, item) => itemAcc + item.cantidad, 0)
    , 0);

    const cantidadTransacciones = ventasHoy.length;

    const totalVentasAyer = ventasAyer.reduce((acc, venta) => {
      return acc + Number(venta.total);
    }, 0);

    const crecimiento = totalVentasAyer > 0 
      ? ((totalVentas - totalVentasAyer) / totalVentasAyer) * 100 
      : 0;

    // Productos más vendidos
    const productosMasVendidos = ventasHoy.reduce((acc, venta) => {
      venta.items.forEach(item => {
        if (acc[item.producto]) {
          acc[item.producto] += item.cantidad;
        } else {
          acc[item.producto] = item.cantidad;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    const topProductos = Object.entries(productosMasVendidos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalVentas,
      totalProductos,
      cantidadTransacciones,
      totalVentasAyer,
      crecimiento,
      topProductos
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(item => (
          <div 
            key={item} 
            className="bg-gray-200 animate-pulse h-36 rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const { 
    totalVentas, 
    totalProductos, 
    cantidadTransacciones,
    totalVentasAyer,
    crecimiento,
    topProductos
  } = calcularEstadisticas();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Tarjeta de Ventas */}
      <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-600 font-semibold">Ventas del Día</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-blue-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-3xl font-bold text-blue-600">
          ${totalVentas.toLocaleString('es-CL', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {cantidadTransacciones} transacciones
        </p>
      </div>

      {/* Tarjeta de Productos */}
      <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-600 font-semibold">Productos Vendidos</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div className="text-3xl font-bold text-green-600">
          {totalProductos}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Productos vendidos hoy
        </p>
      </div>

      {/* Tarjeta de Crecimiento */}
      <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-600 font-semibold">Crecimiento</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-purple-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className={`text-3xl font-bold ${crecimiento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {crecimiento.toFixed(2)}%
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Comparado con ayer
        </p>
      </div>

      {/* Tarjeta de Total de Ventas Ayer */}
      <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-600 font-semibold">Ventas Ayer</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-yellow-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-3xl font-bold text-yellow-600">
          ${totalVentasAyer.toLocaleString('es-CL', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Total de ventas ayer
        </p>
      </div>

      
    </div>
  );
}