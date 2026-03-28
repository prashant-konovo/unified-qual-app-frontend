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
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="bg-background pl-8"
          placeholder="Search subscriptions..."
          type="search"
        />
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-full bg-background sm:w-[130px]">
          <SelectValue placeholder="Plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Plans</SelectItem>
          <SelectItem value="enterprise">Enterprise</SelectItem>
          <SelectItem value="growth">Growth</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="all">
        <SelectTrigger className="w-full bg-background sm:w-[130px]">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Currency</SelectItem>
          <SelectItem value="usd">USD</SelectItem>
          <SelectItem value="eur">EUR</SelectItem>
          <SelectItem value="gbp">GBP</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="all">
        <SelectTrigger className="w-full bg-background sm:w-[130px]">
          <SelectValue placeholder="Panel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Panels</SelectItem>
          <SelectItem value="tech">Tech</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="healthcare">Healthcare</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
