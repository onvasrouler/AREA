import React, { useEffect } from "react";


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

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Le téléchargement va commencer...</h1>
      <p>
        Si le téléchargement ne commence pas automatiquement, cliquez{" "}
        <a href="/shared/client.apk" download="client.apk">
          ici
        </a>
        .
      </p>
    </div>
  );
};
