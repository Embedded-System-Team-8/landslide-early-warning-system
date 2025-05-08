import React, { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"

type MainLayoutProps = {
    children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed)
    }

    React.useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 768) {
          setSidebarCollapsed(true)
        }
      }

      handleResize() // Set initial state based on screen size
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }, [])

    return (
        <div className="flex h-screen bg-background">
            <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={toggleSidebar} />
                <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
            </main>
        </div>
    )
}

export default MainLayout
