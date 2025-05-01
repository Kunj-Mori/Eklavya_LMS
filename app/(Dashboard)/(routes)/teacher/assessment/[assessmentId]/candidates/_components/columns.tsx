"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Session = {
  id: string;
  userId: string;
  status: string;
  score?: number;
  startTime: Date;
  endTime: Date;
};

export const columns: ColumnDef<Session>[] = [
  {
    accessorKey: "userId",
    header: "User ID"
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge className={cn(
          "bg-slate-500",
          status === "COMPLETED" && "bg-emerald-700",
          status === "IN_PROGRESS" && "bg-yellow-700",
        )}>
          {status}
        </Badge>
      )
    }
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => {
      const score = row.getValue("score") as number;
      return (
        <div className="font-medium">
          {score ? `${score}%` : "Not evaluated"}
        </div>
      )
    }
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => {
      const startTime = row.getValue("startTime");
      return (
        <div className="font-medium">
          {startTime ? new Date(startTime).toLocaleString() : "Not started"}
        </div>
      )
    }
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => {
      const endTime = row.getValue("endTime");
      return (
        <div className="font-medium">
          {endTime ? new Date(endTime).toLocaleString() : "Not completed"}
        </div>
      )
    }
  },
]; 