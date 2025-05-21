
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./components/dashboard/Dashboard";
import SeismographView from "./components/sensors/SeismographView";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HistoryView from "./history/HistoryView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } />
          <Route path="/seismograf" element={
            <MainLayout>
              <SeismographView />
            </MainLayout>
          } />
          <Route path="/peta" element={
            <MainLayout>
              <div className="p-8 text-center text-muted-foreground">
                Peta Lokasi akan ditampilkan di sini
              </div>
            </MainLayout>
          } />
          <Route path="/riwayat" element={
            <MainLayout>
              <HistoryView />
            </MainLayout>
          } />
          <Route path="/notifikasi" element={
            <MainLayout>
              <div className="p-8 text-center text-muted-foreground">
                Notifikasi akan ditampilkan di sini
              </div>
            </MainLayout>
          } />
          <Route path="/pengaturan" element={
            <MainLayout>
              <div className="p-8 text-center text-muted-foreground">
                Pengaturan akan ditampilkan di sini
              </div>
            </MainLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
