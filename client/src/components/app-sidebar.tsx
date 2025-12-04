import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  MessageCircle,
  ClipboardList,
  Calendar,
  Stethoscope
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Pacientes",
    url: "/pacientes",
    icon: Users,
  },
  {
    title: "Campañas",
    url: "/campanas",
    icon: Megaphone,
  },
  {
    title: "Conversaciones",
    url: "/conversaciones",
    icon: MessageCircle,
    showBadge: true,
  },
  {
    title: "Acciones del Día",
    url: "/staff-calls",
    icon: ClipboardList,
  },
  {
    title: "Agenda",
    url: "/citas",
    icon: Calendar,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/conversaciones/sin-leer/count"],
    refetchInterval: 30000,
  });
  
  const unreadCount = unreadData?.count ?? 0;

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              Reactivación
            </h2>
            <p className="text-xs text-muted-foreground">Clínicas</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="pt-4">
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className="w-4 h-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.showBadge && unreadCount > 0 && (
                          <Badge 
                            variant="default" 
                            className="h-5 min-w-5 px-1.5 text-xs"
                            data-testid="badge-conversaciones-sin-leer"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
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
