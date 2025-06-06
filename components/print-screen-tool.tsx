"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, X, ZoomIn, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PrintScreenTool() {
  const [printData, setPrintData] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePrintScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        preferCurrentTab: true,
        video: {
          displaySurface: "monitor"
        }
      });
      
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);
      const bitmap = await imageCapture.grabFrame();
      
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      context?.drawImage(bitmap, 0, 0);
      
      const imageData = canvas.toDataURL('image/png');
      setPrintData(imageData);
      
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Print screen captured",
        description: "Your screen is ready to print or download",
      });
    } catch (error) {
      toast({
        title: "Print screen failed",
        description: "Failed to capture screen. Please ensure you've granted the necessary permissions.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (!printData) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print failed",
        description: "Unable to open print window. Please check your popup settings.",
        variant: "destructive",
      });
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Screen</title>
          <style>
            body { margin: 0; padding: 0; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <img src="${printData}" alt="Screen Capture" />
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
    
    toast({
      title: "Print dialog opened",
      description: "Your print dialog should now be open",
    });
  };

  const handleDownload = () => {
    if (!printData) return;
    
    const link = document.createElement('a');
    link.href = printData;
    link.download = `print-screen-${new Date().toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your print screen is being downloaded",
    });
  };

  const clearPrintScreen = () => {
    setPrintData(null);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h3 className="text-xl font-semibold mb-4">Print Screen Options</h3>
        
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Print Screen captures your entire screen just like pressing the Print Screen key on your keyboard, but with more options.
          </p>
          
          <Button 
            onClick={handlePrintScreen} 
            className="w-full mt-4"
          >
            <Printer className="mr-2 h-4 w-4" />
            Capture Print Screen
          </Button>
          
          {printData && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="flex-1"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Preview</h3>
        
        {printData ? (
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-2 right-2 z-10 bg-background/80"
              onClick={clearPrintScreen}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-2 right-12 z-10 bg-background/80"
              onClick={handleDownload}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <img 
              src={printData} 
              alt="Print screen capture" 
              className="w-full h-auto rounded-lg border"
            />
          </div>
        ) : (
          <Card className="border border-dashed">
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div className="text-center space-y-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full inline-flex">
                  <Printer className="h-6 w-6" />
                </div>
                <h4 className="font-semibold">Ready to Capture</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Capture Print Screen" to take a snapshot of your entire screen.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}