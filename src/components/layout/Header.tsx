import { Menu, Bell, ChevronRight } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick: () => void;
}

const breadcrumbMap: Record<string, string> = {
  "/courses": "Mis Cursos",
  "/dashboard": "Mi Evolución",
  "/chat": "Chat",
  "/settings": "Configuración",
  "/admin/users": "Gestión Usuarios",
  "/admin/courses": "Gestión Cursos",
  "/admin/dashboard": "Panel Admin",
};

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: { label: string; path: string }[] = [];

    let currentPath = "";
    for (const path of paths) {
      currentPath += `/${path}`;
      const label = breadcrumbMap[currentPath];
      if (label) {
        breadcrumbs.push({ label, path: currentPath });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            Inicio
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-gray-300" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-3 border-b border-gray-100">
            <h4 className="font-medium text-gray-900">Notificaciones</h4>
          </div>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
            <p className="text-sm text-gray-900">Nuevo curso disponible</p>
            <p className="text-xs text-gray-500">Hace 5 minutos</p>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
            <p className="text-sm text-gray-900">@María te mencionó en #general</p>
            <p className="text-xs text-gray-500">Hace 1 hora</p>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
            <p className="text-sm text-gray-900">Certificado generado</p>
            <p className="text-xs text-gray-500">Hace 2 horas</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
