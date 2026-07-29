import {
  Wrench,
  HardDrive,
  MonitorSmartphone,
  Ticket,
  Package,
  Truck,
  MapPin,
  Wifi,
  ShoppingCart,
  Laptop,
  Shield,
  Headphones,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Wrench,
  HardDrive,
  MonitorSmartphone,
  Ticket,
  Package,
  Truck,
  MapPin,
  Wifi,
  ShoppingCart,
  Laptop,
  Shield,
  Headphones,
};

export function getServiceIcon(name: string): LucideIcon {
  return iconMap[name] ?? Wrench;
}

export const ICON_OPTIONS = Object.keys(iconMap);
