"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Model } from "@/components/model";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { useFilePicker } from "use-file-picker";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import LoadingOverlay from "@/components/loading_overlay";
import { Floor } from "@/types";

export default function Home() {
  const [buildings, setBuildings] = React.useState([
    {
      id: "1",
      name: "Office 1",
      address: "123 Main St",
      floors: [
        // Floors from drawings
        // {
        //   id: "TPG6DL",
        //   title: "Floor 1",
        // },
        {
          id: "CNX50A",
          title: "Floor 3",
        },
        {
          id: "2DSMWK",
          title: "Floor 2",
        },
        {
          id: "R2OTM4",
          title: "Floor 1",
        },
      ] as Floor[],
    },
  ]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [activeBuildingId, setActiveBuildingId] = React.useState("1");
  const [activeFloorId, setActiveFloorId] = React.useState("1");

  const sasToken = process.env.NEXT_PUBLIC_STORAGESASTOKEN;
  const storageAccountName = process.env.NEXT_PUBLIC_STORAGERESOURCENAME;

  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );

  const containerClient: ContainerClient =
    blobService.getContainerClient("quickbimmodels");

  const { openFilePicker } = useFilePicker({
    accept: [".png", ".jpg", ".jpeg"],
    multiple: false,
    // readAs: 'DataURL',
    onFilesSuccessfullySelected: async ({
      plainFiles,
    }: {
      plainFiles: File[];
    }) => {
      const file = plainFiles[0];

      const extension = file.name.split(".").reverse()[0];

      onAddFloor(file, extension);
    },
  });

  const activeBuilding = buildings.find((b) => b.id === activeBuildingId);
  const activeFloor = activeBuilding?.floors.find(
    (f) => f.id === activeFloorId
  );

  const onAddFloor = async (file: File, extension: string) => {
    // Make API call to POST http://api.quickbim.fi/?func=create
    setIsLoading(true);
    const createFileResult = await fetch(
      "http://api.quickbim.fi:8000/?func=create",
      {
        method: "POST",
      }
    );

    console.log(createFileResult);

    const data = await createFileResult.text();

    console.log(data);

    // Data is like this: "('7HQA9Q', '54d6ef30f1f09c33ca8780a4945bb7c56b869b4952b16bd3e0fc74fd', False)"
    // The first value is id and second is hash, parse those
    const regex = /\('([^']+)', '([^']+)',/;
    const match = RegExp(regex).exec(data);

    if (!match) {
      console.error("Failed to parse data");
    }

    const id = match![1];
    const hash = match![2];
    console.log(`ID: ${id}, Hash: ${hash}`);

    await fetch(
      `http://api.quickbim.fi:8000/?func=createandtransform&id=${id}&oformat=.gltf&hash=${hash}&iformat=.${extension}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: file,
      }
    );

    const pollStatus = async () => {
      const response = await fetch(`http://api.quickbim.fi:8000/?func=processes`, {
        method: "GET",
      });
      const data = await response.json();
      const process = data.find(
        (item: any) => item.in === id && item.status === "Done"
      );

      if (process) {
        clearInterval(pollingInterval);
        console.log("Process completed:", process);

        const objectResponse = await fetch(
          `http://api.quickbim.fi/?func=object&id=${id}&oformat=.gltf`,
          {
            method: "GET",
          }
        );

        const gltfJson = await objectResponse.json();

        const gltfBlob = new Blob([JSON.stringify(gltfJson)], {
          type: "application/json",
        });

        const gltfFile = new File([gltfBlob], `${id}.gltf`, {
          type: "application/octet-stream",
        });

        const blobClient = containerClient.getBlockBlobClient(gltfFile.name);

        await blobClient.uploadData(gltfFile, {
          blobHTTPHeaders: { blobContentType: gltfFile.type },
        });

        await onClearAll();

        setIsLoading(false);

        if (activeBuilding) {
          setBuildings([
            ...buildings.filter((b) => b.id !== activeBuildingId),
            {
              ...activeBuilding,
              floors: [
                {
                  id: id,
                  title: `Floor ${activeBuilding.floors.length + 1}`,
                },
                ...activeBuilding.floors,
              ],
            },
          ]);
        }
      }
    };

    const pollingInterval = setInterval(pollStatus, 3000);

    // Optionally, you can add a timeout to stop polling after a certain period
    setTimeout(() => {
      if (isLoading) {
        clearInterval(pollingInterval)
        alert("Timeout reached, polling stopped");
        setIsLoading(false);
      }
    }, 120000);
  };

  const onClearAll = async () => {
    const processesResult = await fetch(
      "http://api.quickbim.fi:8000/?func=processes",
      {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "*",
        },
      }
    );

    const json = await processesResult.json();
    console.log(json);

    for (const process of json) {
      await fetch(
        `http://api.quickbim.fi:8000/?func=remove&id=${process.in}`,
        {
          method: "POST",
        }
      );
    }
  };

  return (
    <SidebarProvider>
      {isLoading && <LoadingOverlay />}
      <AppSidebar
        activeBuildingId={activeBuildingId}
        activeFloorId={activeFloorId}
        onAddFloor={openFilePicker}
        onClearAll={onClearAll}
        onSelectBuilding={(buildingId) => {
          const activeBuilding = buildings.find((b) => b.id === buildingId);
          if (activeBuilding) {
            setActiveBuildingId(activeBuilding.id);
            setActiveFloorId(activeBuilding.floors[0].id);
          }
        }}
        onSelectFloor={(floorId) => {
          setActiveFloorId(floorId);
        }}
        buildings={buildings}
      />
      <main className="w-full">
        {activeFloor && activeBuilding && <Model floor={activeFloor} building={activeBuilding} />}
      </main>
    </SidebarProvider>
  );
}
