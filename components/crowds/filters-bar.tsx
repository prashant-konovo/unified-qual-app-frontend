"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FiltersBar() {
  return (
    <div className="flex w-full min-w-0 flex-col flex-wrap items-start gap-4 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="bg-background pl-8"
          placeholder="Search crowds..."
          type="search"
        />
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-full bg-background sm:w-[180px]">
          <SelectValue placeholder="Subscription Filters" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Subscriptions</SelectItem>
          <SelectItem value="acme">Acme Global</SelectItem>
          <SelectItem value="globex">Globex EU</SelectItem>
          <SelectItem value="internal">Internal Research</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="all">
        <SelectTrigger className="w-full bg-background sm:w-[130px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="profile">Profile</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
          <SelectItem value="employee">Employee</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="all">
        <SelectTrigger className="w-full bg-background sm:w-[140px]">
          <SelectValue placeholder="Panel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Panels</SelectItem>
          <SelectItem value="tech">Tech Base</SelectItem>
          <SelectItem value="consumer">Consumer Panel</SelectItem>
          <SelectItem value="healthcare">Healthcare Net</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
