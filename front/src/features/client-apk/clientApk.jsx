import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from 'lucide-react';
import { useEffect } from "react";

export function ClientApkPage() {
  useEffect(() => {
    const downloadApk = () => {
      const link = document.createElement("a");
      link.href = "/shared/client.apk";
      link.download = "client.apk";
      link.click();
    };

    downloadApk();
  }, []);

  const handleManualDownload = () => {
    const link = document.createElement("a");
    link.href = "/shared/client.apk";
    link.download = "client.apk";
    link.click();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Downloading APK Client</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            The download should start automatically. If it doesn't, click the button below.
          </p>
          <div className="flex justify-center">
            <Button onClick={handleManualDownload} className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
                Download APK
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            If you have any issues, please contact us at <a href="https://github.com/onvasrouler/AREA" target="_blank" rel="noreferrer" className="text-blue-500">GitHub</a>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

