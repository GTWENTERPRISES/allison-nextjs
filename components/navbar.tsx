"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Store, Paperclip } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setTheme(newTheme);
    setIsDarkMode(newTheme === "dark");
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Paperclip className="h-6 w-6" />
          <span className="font-bold text-xl">CyberAllison</span>
        </Link>

        <nav className="flex items-center space-x-4">
          <Link href="/inventario">
            <Button variant="ghost">Inventario</Button>
          </Link>
          <Link href="/compras">
            <Button variant="ghost">Compras</Button>
          </Link>
          <Link href="/venta-nueva">
            <Button variant="ghost">Ventas</Button>
          </Link>
          
          <Button variant="ghost" onClick={toggleTheme}>
            <Sun className="h-5 w-5" />
            
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}