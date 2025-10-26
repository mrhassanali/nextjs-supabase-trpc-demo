"use client";

import * as React from "react";

import { IconDashboard, IconMessage, IconInnerShadowTop } from "@tabler/icons-react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CHAT_URL, DASHBOARD_URL, SITE_URL } from "@/constants/Routes";
import { SITE_NAME } from "@/constants/config";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: DASHBOARD_URL,
      icon: IconDashboard,
    },
    {
      title: "Chat",
      url: CHAT_URL,
      icon: IconMessage,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="pointer-events-none data-[slot=sidebar-menu-button]:!p-1.5">
              <a href={SITE_URL}>
                <IconInnerShadowTop className="!size-5 md:!size-6" />
                <span className="text-base font-semibold md:text-lg">{SITE_NAME}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
