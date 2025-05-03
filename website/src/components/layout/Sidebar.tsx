
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  BarChart2, 
  FileText, 
  Bell, 
  Settings, 
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type SidebarProps = {
  collapsed: boolean;
  toggleSidebar: () => void;
};

const Sidebar = ({ collapsed, toggleSidebar }: SidebarProps) => {
  const navItems = [
    { icon: <Home size={20} />, label: 'Beranda', path: '/' },
    { icon: <BarChart2 size={20} />, label: 'Seismograf', path: '/seismograf' },
    { icon: <MapPin size={20} />, label: 'Peta Lokasi', path: '/peta' },
    { icon: <FileText size={20} />, label: 'Riwayat Data', path: '/riwayat' },
    { icon: <Bell size={20} />, label: 'Notifikasi', path: '/notifikasi' },
    { icon: <Settings size={20} />, label: 'Pengaturan', path: '/pengaturan' },
  ];

  return (
    <div className={cn(
      "h-screen bg-sidebar flex flex-col border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center h-16 px-4">
        {!collapsed && (
          <span className="text-primary font-bold text-xl">WASPADA</span>
        )}
        <Button 
          variant="ghost" 
          className="ml-auto"
          size="icon" 
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </Button>
      </div>

      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center p-2 rounded-md hover:bg-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
            >
              <span className="mr-3">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <div className={cn(
          "rounded-md bg-primary/10 p-4 text-primary text-center",
          collapsed && "p-2"
        )}>
          {collapsed ? (
            <Bell size={20} />
          ) : (
            <>
              <span className="block font-semibold">Sistem Peringatan Dini</span>
              <span className="text-xs">Tanah Bergerak</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
