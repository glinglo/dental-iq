import { 
  LayoutDashboard, 
  Users, 
  FileText,
  MessageCircle,
  Calendar,
  Stethoscope,
  ChevronRight,
  Send,
  TrendingUp,
  Bell,
  Mail
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Presupuestos",
    url: "/presupuestos",
    icon: FileText,
    submenu: [
      {
        title: "Seguimiento",
        url: "/presupuestos/seguimiento",
        icon: Send,
      },
      {
        title: "Analíticas",
        url: "/presupuestos/analiticas",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Campañas",
    url: "/campañas",
    icon: Users,
    submenu: [
      {
        title: "Salud Preventiva",
        url: "/campañas/salud-preventiva",
        icon: Stethoscope,
      },
      {
        title: "Recuperación",
        url: "/campañas/recalls",
        icon: Send,
      },
    ],
  },
  {
    title: "Citas",
    icon: Calendar,
    submenu: [
      {
        title: "Agenda",
        url: "/citas/agenda",
        icon: Calendar,
      },
      {
        title: "Recordatorios",
        url: "/citas/recordatorios",
        icon: Bell,
      },
      {
        title: "Mensajes post-visita",
        url: "/citas/post-visita",
        icon: Mail,
      },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleMenu = (title: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedMenus(newExpanded);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              DentalIQ
            </h2>
            <p className="text-xs text-muted-foreground">Gestión Dental</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="pt-4">
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url || (item.submenu && item.submenu.some(sub => location === sub.url));
                const isExpanded = expandedMenus.has(item.title);
                const hasSubmenu = item.submenu && item.submenu.length > 0;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild={!hasSubmenu && !!item.url}
                      isActive={isActive}
                      onClick={hasSubmenu ? () => toggleMenu(item.title) : undefined}
                      className={cn(hasSubmenu && "cursor-pointer")}
                    >
                      {hasSubmenu ? (
                        <div className="flex items-center w-full">
                          <item.icon className="w-4 h-4" />
                          <span className="flex-1">{item.title}</span>
                          <ChevronRight className={cn(
                            "w-4 h-4 transition-transform",
                            isExpanded && "rotate-90"
                          )} />
                        </div>
                      ) : item.url ? (
                        <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                          <item.icon className="w-4 h-4" />
                          <span className="flex-1">{item.title}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center w-full">
                          <item.icon className="w-4 h-4" />
                          <span className="flex-1">{item.title}</span>
                        </div>
                      )}
                    </SidebarMenuButton>
                    {hasSubmenu && isExpanded && (
                      <SidebarMenuSub>
                        {item.submenu.map((subItem) => {
                          const isSubActive = location === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isSubActive}>
                                <Link href={subItem.url}>
                                  <subItem.icon className="w-4 h-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
