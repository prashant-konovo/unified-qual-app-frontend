"use client";

import { ClockIcon, MinusIcon, PlusIcon, UploadIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TIMEZONES } from "../data";
import type { ModeratorOption, ProjectOption } from "./AvailabilityDialog";

interface Props {
  moderatorFilter: string;
  moderators: ModeratorOption[];
  onImport: (file: File) => void;
  onModeratorChange: (v: string) => void;
  onProjectChange: (v: string) => void;
  onTimeBufferChange: (v: number) => void;
  onTimezoneChange: (v: string) => void;
  projectFilter: string;
  projects: ProjectOption[];
  timeBuffer: number;
  timezone: string;
}

export function FiltersBar({
  projectFilter,
  moderatorFilter,
  timezone,
  timeBuffer,
  moderators,
  projects,
  onProjectChange,
  onModeratorChange,
  onTimezoneChange,
  onTimeBufferChange,
  onImport,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Project filter */}
      <Select onValueChange={onProjectChange} value={projectFilter}>
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {projects.map((p) => (
            <SelectItem className="text-xs" key={p.id} value={p.name}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Moderator filter */}
      <Select onValueChange={onModeratorChange} value={moderatorFilter}>
        <SelectTrigger className="h-8 w-[160px] text-xs">
          <SelectValue placeholder="All moderators" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All moderators</SelectItem>
          {moderators.map((m) => (
            <SelectItem className="text-xs" key={m.id} value={m.name}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Timezone */}
      <Select onValueChange={onTimezoneChange} value={timezone}>
        <SelectTrigger className="h-8 w-[160px] text-xs">
          <SelectValue placeholder="Timezone" />
        </SelectTrigger>
        <SelectContent>
          {TIMEZONES.map((tz) => (
            <SelectItem className="text-xs" key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator className="h-6" orientation="vertical" />

      {/* Time buffer */}
      <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1">
        <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground text-xs">Buffer:</span>
        <Button
          className="h-5 w-5"
          onClick={() => onTimeBufferChange(Math.max(0, timeBuffer - 5))}
          size="icon"
          variant="ghost"
        >
          <MinusIcon className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-semibold text-xs">
          {timeBuffer}m
        </span>
        <Button
          className="h-5 w-5"
          onClick={() => onTimeBufferChange(Math.min(120, timeBuffer + 5))}
          size="icon"
          variant="ghost"
        >
          <PlusIcon className="h-3 w-3" />
        </Button>
      </div>

      <Separator className="h-6" orientation="vertical" />

      {/* Import */}
      <input
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onImport(file);
          }
          e.target.value = "";
        }}
        ref={fileInputRef}
        type="file"
      />
      <Button
        className="h-8 gap-1.5 text-xs"
        onClick={() => fileInputRef.current?.click()}
        size="sm"
        variant="outline"
      >
        <UploadIcon className="h-3.5 w-3.5" />
        Import Availability
      </Button>
    </div>
  );
}
