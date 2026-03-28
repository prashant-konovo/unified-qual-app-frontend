"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { mockCrowds } from "@/app/crowds/data";
import { CreateCrowdWizard } from "@/components/crowds/create-crowd-wizard";
import { CrowdsTable } from "@/components/crowds/crowds-table";
import { FiltersBar } from "@/components/crowds/filters-bar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function CrowdsPage() {
  const [data, setData] = useState(mockCrowds);

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-background/95">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator className="mr-2 h-4" orientation="vertical" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">HalaQual Platform</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Crowds</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col space-y-6 p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">Crowds</h1>
            <p className="mt-1 text-muted-foreground">
              Manage participant groups for research.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateCrowdWizard />
          </div>
        </div>

        {/* Informational Banner */}
        <Alert className="border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>Inactive Crowds Cleanup</AlertTitle>
          <AlertDescription>
            Crowds unused for over 180 days will be automatically deleted to
            maintain data quality.
          </AlertDescription>
        </Alert>

        {/* Filters Bar */}
        <FiltersBar />

        {/* Data Table */}
        <CrowdsTable data={data} />
      </div>
    </div>
  );
}
