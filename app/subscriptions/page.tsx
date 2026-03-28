"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Subscription } from "@/app/subscriptions/data";
import { CreateSubscriptionWizard } from "@/components/subscriptions/create-subscription-wizard";
import { FiltersBar } from "@/components/subscriptions/filters-bar";
import { SubscriptionsTable } from "@/components/subscriptions/subscriptions-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { subscriptionsApi } from "@/lib/api/subscriptions";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    subscriptionsApi
      .getSubscriptionsList()
      .then((data) => {
        if (Array.isArray(data)) {
          setSubscriptions(data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-lg">
                  Subscriptions
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-zinc-50/50 p-4 md:p-8 dark:bg-zinc-950/20">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
            <div>
              <h1 className="font-bold text-3xl text-foreground tracking-tight">
                Subscriptions
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                Manage all client subscriptions
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CreateSubscriptionWizard />
            </div>
          </div>

          <div className="space-y-4">
            <FiltersBar />
            <div className="fade-in slide-in-from-bottom-4 animate-in duration-500 will-change-transform">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center rounded-md border bg-card">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <SubscriptionsTable data={subscriptions} />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
