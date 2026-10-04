"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  FileText,
  Award,
  AlertTriangle,
  CreditCard,
  Building2,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/formatters";

interface AuditTrailWorkflowProps {
  initialLogs?: any[];
}

export function AuditTrailWorkflow({ initialLogs }: AuditTrailWorkflowProps = {}) {
  const [logs, setLogs] = useState<any[]>(initialLogs || []);
  const [isLoading, setIsLoading] = useState(initialLogs === undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActionFilter, setSelectedActionFilter] = useState("ALL");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/audit-logs?limit=150");
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialLogs !== undefined) {
      setLogs(initialLogs);
      setIsLoading(false);
    } else {
      fetchLogs();
    }
  }, [initialLogs]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "GRADE_RECORDED":
      case "GRADE_MODIFIED":
        return <Badge variant="info">GRADE UPDATE</Badge>;
      case "BOARD_PUBLISHED_RESULTS":
        return <Badge variant="purple" dot>BOARD RATIFIED</Badge>;
      case "BOARD_WITHHELD_RESULTS":
        return <Badge variant="warning" dot>BOARD WITHHELD</Badge>;
      case "GRADE_PUBLISHED":
        return <Badge variant="success">PUBLISHED</Badge>;
      case "GRADE_WITHHELD":
        return <Badge variant="secondary">WITHHELD</Badge>;
      case "EC_CLAIM_APPROVED":
        return <Badge variant="success" dot>EC APPROVED</Badge>;
      case "EC_CLAIM_REJECTED":
        return <Badge variant="danger" dot>EC REJECTED</Badge>;
      case "SCHOLARSHIP_AWARDED":
        return <Badge variant="purple">SCHOLARSHIP</Badge>;
      case "INSTALMENT_PLAN_GENERATED":
        return <Badge variant="info">INSTALMENTS</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      selectedActionFilter === "ALL" ||
      (selectedActionFilter === "GRADES" &&
        (log.action.includes("GRADE") || log.action.includes("BOARD"))) ||
      (selectedActionFilter === "EC" && log.action.includes("EC")) ||
      (selectedActionFilter === "FINANCE" &&
        (log.action.includes("FEE") ||
          log.action.includes("SCHOLARSHIP") ||
          log.action.includes("INSTALMENT")));

    return matchesSearch && matchesAction;
  });

  const gradeCount = logs.filter((l) => l.action.includes("GRADE")).length;
  const boardCount = logs.filter((l) => l.action.includes("BOARD")).length;
  const ecCount = logs.filter((l) => l.action.includes("EC")).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Registry Audit Trail & Board Moderation
            </h2>
            <Badge variant="purple" dot>
              Tamper-Evident Ledger
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable legal event trail tracking grade allocations, examination board ratifications, EC claim determinations, and financial adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            isLoading={isLoading}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh Stream
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200 dark:border-white/10">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Audited Actions
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block font-mono">
            {logs.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Cryptographically sealed events
          </span>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-white/10">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Grade Moderation Logs
          </span>
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block font-mono">
            {gradeCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Assessor mark submissions
          </span>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-white/10">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Exam Board Ratifications
          </span>
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 block font-mono">
            {boardCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Registry publication actions
          </span>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-white/10">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            EC Claims Determined
          </span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 block font-mono">
            {ecCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Approved or waived penalties
          </span>
        </Card>
      </div>

      {/* Audit Log Stream */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="text-base">Institutional Event Stream</CardTitle>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Action Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setSelectedActionFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedActionFilter === "ALL"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setSelectedActionFilter("GRADES")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedActionFilter === "GRADES"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Grading & Board
              </button>
              <button
                onClick={() => setSelectedActionFilter("EC")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedActionFilter === "EC"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                EC Claims
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 sm:w-56"
              />
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mb-2" />
              <p className="text-xs">Loading audit events...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 italic text-xs">
              No audit records matched your filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getActionBadge(log.action)}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {log.actor}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {log.role}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID: {log.id.slice(0, 10)}...
                      </span>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>Target: {log.entityType}</span>
                      <span>•</span>
                      <span>Terminal: {log.ipAddress}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400 block">
                      {formatDateTime(log.createdAt)}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider block mt-0.5">
                      ● Audit Sealed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
