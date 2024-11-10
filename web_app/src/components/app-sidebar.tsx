"use client";

import {  BuildingIcon, Minus, Plus } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Building } from "@/types";
import { BuildingSwitcher } from "./building-switcher";

type AppSidebarProps = {
  buildings: Building[];
  activeBuildingId: string;
  activeFloorId: string;
  onSelectBuilding: (buildingId: string) => void;
  onSelectFloor: (floorId: string) => void;
  onAddFloor: () => void;
  onClearAll: () => void;
};

export function AppSidebar({
  buildings,
  activeBuildingId,
  activeFloorId,
  onSelectBuilding,
  onSelectFloor,
  onAddFloor,
  onClearAll,
}: Readonly<AppSidebarProps>) {
  const activeBuilding = buildings.find((b) => b.id === activeBuildingId);

  return (
    <Sidebar>
      <SidebarHeader>
        <BuildingSwitcher
          buildings={buildings}
          activeBuildingId={activeBuildingId}
          onSelectBuilding={onSelectBuilding}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Floors</SidebarGroupLabel>
          {/* <SidebarGroupAction title="Add Project" onClick={onAddFloor}>
            <div>
              <Plus /> <span className="sr-only">Add Floor</span>
            </div>
          </SidebarGroupAction> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {activeBuilding?.floors.map((floor) => (
                <SidebarMenuItem key={floor.title} >
                  <SidebarMenuButton
                    className= {floor.id === activeFloorId ?"bg-blue-200 hover:bg-blue-200" : ""}
                    asChild
                    onClick={() => onSelectFloor(floor.id)}
                  >
                    <div>
                      <BuildingIcon />
                      <span>{floor.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <p className="mb-2">New floors can be added by uploading photo of floorplan and we'll automatically create the 3d model.</p>
              <p>Adding new floors is disabled due to too heavy server load. Come to our table (269) for demo.</p>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* <SidebarMenuButton asChild onClick={onClearAll}>
          <div>
            <Minus />
            <span>Clear all</span>
          </div>
        </SidebarMenuButton> */}
      </SidebarFooter>
    </Sidebar>
  );
}
