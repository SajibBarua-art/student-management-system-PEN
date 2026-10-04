"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit2,
  Calendar,
  Mail,
  GraduationCap,
  AlertCircle,
  CreditCard,
  FileText,
  CheckCircle,
  Sparkles,
  AlertTriangle,
  Printer,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { calculateAcademicStanding } from "@/lib/academic-engine";
import { OfficialTranscriptModal } from "@/components/documents/OfficialTranscriptModal";
import { Pagination } from "@/components/ui/pagination";

interface EnrolmentWorkflowProps {
  students: any[];
  programmes: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenPaymentModal: (studentId: string) => void;
  isEnrolModalOpen: boolean;
  setIsEnrolModalOpen: (open: boolean) => void;
}

export function EnrolmentWorkflow({
  students,
  programmes,
  isLoading,
  onRefresh,
  onOpenPaymentModal,
  isEnrolModalOpen,
  setIsEnrolModalOpen,
}: EnrolmentWorkflowProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Modals & Drawers
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [isStatusEditOpen, setIsStatusEditOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<string>("ENROLLED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New Student Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "2003-05-15",
    programmeId: programmes[0]?.id || "",
    academicYear: "2024/2025",
    status: "ENROLLED",
  });

  // Filter students client-side
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      searchTerm === "" ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProgramme =
      selectedProgramme === "all" || s.programmeId === selectedProgramme;

    const matchesStatus =
      selectedStatus === "all" || s.status === selectedStatus;

    const matchesOverdue = !overdueOnly || s.isOverdue;

    return matchesSearch && matchesProgramme && matchesStatus && matchesOverdue;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedProgramme, selectedStatus, overdueOnly]);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENROLLED":
        return <Badge variant="success" dot>Enrolled</Badge>;
      case "DEFERRED":
        return <Badge variant="warning" dot>Deferred</Badge>;
      case "WITHDRAWN":
        return <Badge variant="danger" dot>Withdrawn</Badge>;
      case "COMPLETED":
        return <Badge variant="purple" dot>Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create student");
      }

      setIsEnrolModalOpen(false);
      setFormData({
        fullName: "",
        email: "",
        dateOfBirth: "2003-05-15",
        programmeId: programmes[0]?.id || "",
        academicYear: "2024/2025",
        status: "ENROLLED",
      });
      onRefresh();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToUpdate }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setIsStatusEditOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProgrammeDetails = programmes.find(
    (p) => p.id === formData.programmeId
  );

  return (
    <div className="space-y-6">
      {/* Workflow Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Student Enrolment Registry
            </h2>
            <Badge variant="purple">{students.length} Total Registered</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Register students with auto-generated IDs, assign programme fee schedules, and filter active records.
          </p>
        </div>
        <Button onClick={() => setIsEnrolModalOpen(true)} variant="gradient" className="shrink-0">
          <UserPlus className="w-4 h-4 mr-2" />
          Enrol New Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, student ID, or email..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Programme Filter */}
          <div>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">All Programmes</option>
              {programmes.map((p) => (
                <option key={p.id} value={p.id} className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">All Statuses</option>
              <option value="ENROLLED" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Enrolled</option>
              <option value="DEFERRED" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Deferred</option>
              <option value="WITHDRAWN" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Withdrawn</option>
              <option value="COMPLETED" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Completed</option>
            </select>
          </div>

          {/* Overdue Only Toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                overdueOnly
                  ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-300"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-900/70 dark:border-white/10 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${overdueOnly ? "text-rose-500 dark:text-rose-400" : "text-slate-400 dark:text-slate-500"}`} />
              <span>Overdue Only</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Student Records Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-4 px-5">Student</th>
                <th className="py-4 px-5">Student ID</th>
                <th className="py-4 px-5">Programme</th>
                <th className="py-4 px-5">Academic Year</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Tuition Balance</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mb-2" />
                    <p>Loading student directory from PostgreSQL...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 dark:text-slate-400">
                    No student records found matching the active filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const initials = student.fullName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Avatar & Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-md shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {student.fullName}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="py-4 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {student.studentId}
                      </td>

                      {/* Programme */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {student.programme?.code}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {student.programme?.name}
                        </div>
                      </td>

                      {/* Year */}
                      <td className="py-4 px-5 text-slate-700 dark:text-slate-300 font-medium">
                        {student.academicYear}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {getStatusBadge(student.status)}
                      </td>

                      {/* Balance & Overdue Flag */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              (student.balance ?? student.financialSummary?.balance ?? 0) > 0
                                ? "text-slate-900 dark:text-slate-200"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {formatCurrency(student.balance ?? student.financialSummary?.balance)}
                          </span>
                          {student.isOverdue && (
                            <Badge variant="danger" dot className="text-[10px] py-0 px-2">
                              OVERDUE
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsDetailModalOpen(true);
                            }}
                            title="Inspect Student Dossier"
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudent(student);
                              setStatusToUpdate(student.status);
                              setIsStatusEditOpen(true);
                            }}
                            title="Change Enrolment Status"
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {student.balance > 0 && (
                            <button
                              type="button"
                              onClick={() => onOpenPaymentModal(student.id)}
                              title="Record Payment"
                              className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredStudents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="students"
        />
      </Card>

      {/* Enrol New Student Modal */}
      <Modal
        isOpen={isEnrolModalOpen}
        onClose={() => setIsEnrolModalOpen(false)}
        title="Enrol New Student Record"
        description="Register a student into the PEN Global Registry. Unique Student ID will be generated automatically."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-200 dark:border-indigo-500/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-300 uppercase tracking-wider font-bold block">
                Next Auto-Generated Student ID
              </span>
              <span className="font-mono font-extrabold text-slate-900 dark:text-white text-base">
                SMS-2025-XXXX (Sequential Sequence)
              </span>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30">
              System Assigned
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jonathan Edwards"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Institutional Email *
              </label>
              <input
                type="email"
                required
                placeholder="name@campus.ac.uk"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Programme *
              </label>
              <select
                value={formData.programmeId}
                onChange={(e) =>
                  setFormData({ ...formData, programmeId: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {programmes.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Year *
              </label>
              <input
                type="text"
                required
                placeholder="2024/2025"
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Enrolment Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ENROLLED" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Enrolled (Active)</option>
              <option value="DEFERRED" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Deferred</option>
              <option value="WITHDRAWN" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Withdrawn</option>
              <option value="COMPLETED" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Completed</option>
            </select>
          </div>

          {selectedProgrammeDetails && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                Automatic Tuition Fee Assignment:
              </span>
              Enrolling in {selectedProgrammeDetails.name} will automatically create a fee schedule of{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {formatCurrency(selectedProgrammeDetails.standardFee)}
              </strong>{" "}
              due in 30 days.
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEnrolModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" isLoading={isSubmitting}>
              Complete Enrolment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Enrolment Status Modal */}
      <Modal
        isOpen={isStatusEditOpen}
        onClose={() => setIsStatusEditOpen(false)}
        title="Update Student Enrolment Status"
        description={`Modify current status for ${selectedStudent?.fullName} (${selectedStudent?.studentId})`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select New Enrolment Status
            </label>
            <select
              value={statusToUpdate}
              onChange={(e) => setStatusToUpdate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ENROLLED" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Enrolled (Active)</option>
              <option value="DEFERRED" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Deferred</option>
              <option value="WITHDRAWN" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Withdrawn</option>
              <option value="COMPLETED" className="bg-white text-slate-900 dark:bg-[#111625] dark:text-white">Completed</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusEditOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} variant="gradient" isLoading={isSubmitting}>
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Student Dossier Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Student Registry Dossier"
        maxWidth="xl"
      >
        {selectedStudent && (
          <div className="space-y-5 text-slate-700 dark:text-slate-200">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 gap-3">
              <div>
                <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold block">
                  {selectedStudent.studentId}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedStudent.fullName}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{selectedStudent.email}</span>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsTranscriptModalOpen(true)}
                    className="text-xs h-7 px-2.5 font-bold"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                    Print Transcript
                  </Button>
                  {getStatusBadge(selectedStudent.status)}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  Enrolled: {formatDate(selectedStudent.createdAt)}
                </div>
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Programme</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedStudent.programme?.code}
                </span>
              </div>
              <div className="p-3.5 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Academic Year</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedStudent.academicYear}
                </span>
              </div>
              <div className="p-3.5 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Date of Birth</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatDate(selectedStudent.dateOfBirth)}
                </span>
              </div>
              <div className="p-3.5 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Fee Balance</span>
                <span
                  className={`font-bold ${
                    (selectedStudent.balance ?? selectedStudent.financialSummary?.balance ?? 0) > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {formatCurrency(selectedStudent.balance ?? selectedStudent.financialSummary?.balance)}
                </span>
              </div>
            </div>

            {/* Academic Standing & WAM */}
            {(() => {
              const standing = calculateAcademicStanding(selectedStudent.grades || [], false);
              return (
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400">
                        Academic Standing & Progression
                      </span>
                      <Badge variant={standing.badgeVariant} dot>
                        {standing.standingLabel}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                      {standing.awardClassification} • {standing.progressionDecision}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-right shrink-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">WAM:</span>
                    <span className="font-mono text-base font-black text-indigo-600 dark:text-indigo-400">
                      {standing.wam}%
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {standing.totalEarnedCredits} Credits Earned
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Assessment Grades */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Assessment Grades Recorded
              </h4>
              {selectedStudent.grades?.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/[0.04]">
                  No grades recorded for this student yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedStudent.grades?.map((g: any) => (
                    <div
                      key={g.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {g.assessment?.title}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">
                          {g.assessment?.moduleCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-base text-slate-900 dark:text-white">
                          {g.numericGrade}%
                        </span>
                        <Badge variant="outline">{g.classification}</Badge>
                        <Badge variant={g.isPublished ? "success" : "warning"} dot>
                          {g.isPublished ? "Published" : "Withheld"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Official Academic Transcript Modal */}
      {selectedStudent && (
        <OfficialTranscriptModal
          isOpen={isTranscriptModalOpen}
          onClose={() => setIsTranscriptModalOpen(false)}
          student={selectedStudent}
          academicStanding={calculateAcademicStanding(
            selectedStudent.grades || [],
            false
          )}
        />
      )}
    </div>
  );
}
