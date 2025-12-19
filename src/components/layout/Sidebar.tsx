import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  BarChart3,
  MessageSquare,
  Settings,
  Users,
  LogOut,
  ChevronDown,
  X,
  Network,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Mis Cursos", href: "/courses", icon: BookOpen, roles: ["guest", "admin", "super_admin"] },
  { name: "Mi Evolución", href: "/dashboard", icon: BarChart3, roles: ["guest", "admin", "super_admin"] },
  { name: "Chat", href: "/chat", icon: MessageSquare, roles: ["guest", "admin", "super_admin"] },
  { name: "Mapeado", href: "/mapping", icon: Network, roles: ["admin", "super_admin"] },
  { name: "Configuración", href: "/settings", icon: Settings, roles: ["admin", "super_admin"] },
  { name: "Gestión Usuarios", href: "/admin/users", icon: Users, roles: ["admin", "super_admin"] },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { profile, signOut, isAdmin } = useAuth();

  const filteredNavigation = navigation.filter((item) =>
    profile ? item.roles.includes(profile.role) : false
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LC</span>
            </div>
            <span className="font-semibold text-gray-900">Lovable</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== "/" && location.pathname.startsWith(item.href));

            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Administración
                </p>
              </div>
              <NavLink
                to="/admin/courses"
                onClick={onClose}
                className={cn(
                  "sidebar-item",
                  location.pathname.startsWith("/admin/courses") && "sidebar-item-active"
                )}
              >
                <BookOpen className="h-5 w-5" />
                <span>Gestión Cursos</span>
              </NavLink>
              <NavLink
                to="/admin/dashboard"
                onClick={onClose}
                className={cn(
                  "sidebar-item",
                  location.pathname === "/admin/dashboard" && "sidebar-item-active"
                )}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Panel Admin</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile ? getInitials(profile.full_name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile?.full_name || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {profile?.role?.replace("_", " ") || "Guest"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <NavLink to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="text-error focus:text-error"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
