import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FullscreenIcon, ZoomIn, ZoomOut } from 'lucide-react';
import SensorChart from './SensorChart';

// Mock data for our seismograph
const generateSeismographData = (length: number, axis: string) => {
  const baseMultiplier = axis === 'x' ? 1 : axis === 'y' ? 2 : 3;
  const volatility = axis === 'z' ? 1.5 : 1;
  
  return Array.from({ length }, (_, i) => {
    const time = new Date(Date.now() - (length - i) * 1000).toISOString().substring(11, 19);
    // Create some randomness + wave pattern
    const sinComponent = Math.sin(i * 0.1) * baseMultiplier;
    const randomComponent = (Math.random() - 0.5) * volatility;
    const value = sinComponent + randomComponent;
    
    return { time, value };
  });
};

const SeismographView = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Generate mock data for our three axes
  const xData = generateSeismographData(100, 'x');
  const yData = generateSeismographData(100, 'y');
  const zData = generateSeismographData(100, 'z');
  
  const handleZoomIn = () => {
    if (zoomLevel < 3) setZoomLevel(zoomLevel + 0.5);
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 0.5) setZoomLevel(zoomLevel - 0.5);
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };
  
  return (
    <Card className={`${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''} overflow-hidden`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Seismograf Realtime</CardTitle>
            <CardDescription>Data getaran seismik dari sensor MPU6050</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              <FullscreenIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Semua Sumbu</TabsTrigger>
            <TabsTrigger value="x">Sumbu X</TabsTrigger>
            <TabsTrigger value="y">Sumbu Y</TabsTrigger>
            <TabsTrigger value="z">Sumbu Z</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'left center' }} 
                 className="transition-transform">
              <SensorChart 
                title="Sumbu X" 
                data={xData} 
                color="#ef4444" 
                unit="g" 
              />
            </div>
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'left center' }} 
                 className="transition-transform">
              <SensorChart 
                title="Sumbu Y" 
                data={yData} 
                color="#22c55e"
                unit="g" 
              />
            </div>
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'left center' }} 
                 className="transition-transform">
              <SensorChart 
                title="Sumbu Z" 
                data={zData} 
                color="#3b82f6"
                unit="g" 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="x">
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'left center' }} 
                 className="min-h-[300px] transition-transform">
              <SensorChart 
                title="Sumbu X" 
                data={xData} 
                description="Detail getaran pada sumbu X" 
                color="#ef4444"
                unit="g" 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="y">
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'left center' }} 
                 className="min-h-[300px] transition-transform">
              <SensorChart 
                title="Sumbu Y" 
                data={yData} 
                description="Detail getaran pada sumbu Y" 
                color="#22c55e"
                unit="g" 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="z">
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'left center' }} 
                 className="min-h-[300px] transition-transform">
              <SensorChart 
                title="Sumbu Z" 
                data={zData} 
                description="Detail getaran pada sumbu Z" 
                color="#3b82f6"
                unit="g" 
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SeismographView;
