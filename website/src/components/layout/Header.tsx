import React from "react"
import { Bell, Search, UserRound, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Add prop type for onMenuClick
type HeaderProps = {
    onMenuClick?: () => void
}

const Header = ({ onMenuClick }: HeaderProps) => {
    return (
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center md:hidden gap-2">
                {/* Mobile menu button */}
                <button
                    className="mr-2 p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                    onClick={onMenuClick}
                    aria-label="Buka menu"
                >
                    <Menu size={24} />
                </button>
                {/* Mobile logo */}
                <span className="font-bold text-primary">LEW System</span>
            </div>

            <div className="hidden md:block flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari lokasi atau sensor..." className="pl-8" />
                </div>
            </div>

            {/* Notification and user menu: hidden on mobile, flex on md+ */}
            <div className="hidden md:flex items-center space-x-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-status-danger rounded-full"></span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-80 overflow-auto">
                            <DropdownMenuItem className="cursor-pointer">
                                <div className="flex items-start gap-2">
                                    <div className="status-indicator status-danger mt-1"></div>
                                    <div>
                                        <p className="font-medium">Peringatan Bahaya</p>
                                        <p className="text-sm text-muted-foreground">
                                            Sensor Desa Sukamaju mendeteksi getaran yang signifikan.
                                        </p>
                                        <p className="text-xs text-muted-foreground">2 menit yang lalu</p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <div className="flex items-start gap-2">
                                    <div className="status-indicator status-warning mt-1"></div>
                                    <div>
                                        <p className="font-medium">Peringatan</p>
                                        <p className="text-sm text-muted-foreground">
                                            Kelembaban tanah di Desa Sejahtera mencapai level siaga.
                                        </p>
                                        <p className="text-xs text-muted-foreground">20 menit yang lalu</p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer justify-center text-primary">
                            Lihat semua notifikasi
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative" size="sm">
                            <Avatar className="h-8 w-8">
                                <UserRound />
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">Profil</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Pengaturan</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">Keluar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default Header
