"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BulkUploadResult } from "@/lib/api/moderators";
import { moderatorsApi } from "@/lib/api/moderators";

interface Props {
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  open: boolean;
}

export function BulkUploadDialog({ open, onOpenChange, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }
    setIsUploading(true);
    try {
      const res = await moderatorsApi.bulkUpload(file);
      setResult(res);
      if (res.created > 0) {
        toast.success(
          `${res.created} moderator${res.created > 1 ? "s" : ""} imported successfully`
        );
        onSuccess();
      }
      if (res.failed > 0) {
        toast.warning(
          `${res.failed} row${res.failed > 1 ? "s" : ""} failed — see details below`
        );
      }
    } catch {
      toast.error("Bulk upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Moderators</DialogTitle>
          <DialogDescription>
            Upload a CSV with columns:{" "}
            <code className="rounded bg-muted px-1 text-xs">
              name, email, phone
            </code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <button
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted-foreground/30 border-dashed p-8 transition-colors hover:border-primary/50 hover:bg-muted/30"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              {file ? file.name : "Click to select a CSV file"}
            </p>
            {file && (
              <button
                className="flex items-center gap-1 text-destructive text-xs hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setResult(null);
                }}
                type="button"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            )}
            <input
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
              ref={inputRef}
              type="file"
            />
          </button>

          {/* CSV format hint */}
          <div className="rounded-md bg-muted/50 p-3 text-muted-foreground text-xs">
            <p className="mb-1 font-medium">Expected format:</p>
            <pre className="font-mono">
              name,email,phone{"\n"}John Doe,john@example.com,9876543210
            </pre>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-2 rounded-md border p-3 text-sm">
              <div className="flex gap-3">
                <Badge
                  className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                  variant="outline"
                >
                  {result.created} created
                </Badge>
                {result.failed > 0 && (
                  <Badge
                    className="border-red-500/20 bg-red-500/10 text-red-600"
                    variant="outline"
                  >
                    {result.failed} failed
                  </Badge>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {result.errors.map((e) => (
                    <p
                      className="text-destructive text-xs"
                      key={`${e.row}-${e.email ?? ""}`}
                    >
                      Row {e.row}
                      {e.email ? ` (${e.email})` : ""}: {e.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose} type="button" variant="outline">
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              disabled={!file || isUploading}
              onClick={handleUpload}
              type="button"
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
