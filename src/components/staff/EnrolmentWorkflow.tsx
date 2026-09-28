"use client";

import React, { useState } from "react";
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
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate, getStatusBadgeColor } from "@/lib/formatters";

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

  // Handle student creation
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

  // Handle status update
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
    <div className="space-y-5">
      {/* Workflow Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Student Enrolment Registry
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Add, verify, and maintain student records with auto-generated IDs and fee schedules.
          </p>
        </div>
        <Button onClick={() => setIsEnrolModalOpen(true)} className="shrink-0">
          <UserPlus className="w-4 h-4 mr-2" />
          Enrol New Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, student ID, or email..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Programme Filter */}
            <div>
              <select
                value={selectedProgramme}
                onChange={(e) => setSelectedProgramme(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Programmes</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
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
                className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Enrolment Statuses</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="DEFERRED">Deferred</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Overdue Only Toggle */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={overdueOnly}
                  onChange={(e) => setOverdueOnly(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Overdue Fees Only</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Records Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Full Name & Email</th>
                <th className="py-3.5 px-4">Programme</th>
                <th className="py-3.5 px-4">Academic Year</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Fee Balance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2" />
                    <p>Loading student directory...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No student records match the active search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {student.studentId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {student.fullName}
                      </div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-xs">
                        {student.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {student.programme?.code}
                      </div>
                      <div className="text-[11px] text-zinc-500 max-w-[200px] truncate">
                        {student.programme?.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                      {student.academicYear}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge className={getStatusBadgeColor(student.status)}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold ${
                            student.balance > 0
                              ? "text-zinc-900 dark:text-zinc-100"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {formatCurrency(student.balance)}
                        </span>
                        {student.isOverdue && (
                          <Badge variant="danger" className="text-[10px] py-0 px-1.5">
                            OVERDUE
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsDetailModalOpen(true);
                          }}
                          title="View Full Student Record"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-800 transition-colors"
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
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {student.balance > 0 && (
                          <button
                            type="button"
                            onClick={() => onOpenPaymentModal(student.id)}
                            title="Record Payment"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Enrol New Student Modal */}
      <Modal
        isOpen={isEnrolModalOpen}
        onClose={() => setIsEnrolModalOpen(false)}
        title="Enrol New Student"
        description="Create an official student record in the registry database. A unique Student ID will be generated automatically."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {formError}
            </div>
          )}

          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block">
                Auto-Generated Student ID
              </span>
              <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 text-base">
                SMS-2025-XXXX (Sequential Next)
              </span>
            </div>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-indigo-200 font-medium">
              System Generated
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Jonathan Edwards"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
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
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Academic Programme *
              </label>
              <select
                value={formData.programmeId}
                onChange={(e) =>
                  setFormData({ ...formData, programmeId: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
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
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Initial Enrolment Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ENROLLED">Enrolled (Active)</option>
              <option value="DEFERRED">Deferred</option>
              <option value="WITHDRAWN">Withdrawn</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {selectedProgrammeDetails && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                Automatic Fee Assignment:
              </span>
              Enrolling in {selectedProgrammeDetails.name} will automatically assign standard tuition of{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {formatCurrency(selectedProgrammeDetails.standardFee)}
              </strong>{" "}
              due in 30 days.
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEnrolModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
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
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Select New Enrolment Status
            </label>
            <select
              value={statusToUpdate}
              onChange={(e) => setStatusToUpdate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ENROLLED">Enrolled (Active)</option>
              <option value="DEFERRED">Deferred</option>
              <option value="WITHDRAWN">Withdrawn</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusEditOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} isLoading={isSubmitting}>
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Student Full Record Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Student Registry Dossier"
        maxWidth="xl"
      >
        {selectedStudent && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 gap-3">
              <div>
                <span className="font-mono text-xs text-indigo-600 font-bold block">
                  {selectedStudent.studentId}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {selectedStudent.fullName}
                </h3>
                <span className="text-xs text-zinc-500">{selectedStudent.email}</span>
              </div>
              <div className="text-right">
                <Badge className={getStatusBadgeColor(selectedStudent.status)}>
                  {selectedStudent.status}
                </Badge>
                <div className="text-xs text-zinc-500 mt-1">
                  Enrolled: {formatDate(selectedStudent.createdAt)}
                </div>
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-zinc-500 block">Programme</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedStudent.programme?.code}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-zinc-500 block">Academic Year</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedStudent.academicYear}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-zinc-500 block">Date of Birth</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatDate(selectedStudent.dateOfBirth)}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-zinc-500 block">Outstanding Fee</span>
                <span
                  className={`font-semibold ${
                    selectedStudent.balance > 0
                      ? "text-rose-600 dark:text-rose-400 font-bold"
                      : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(selectedStudent.balance)}
                </span>
              </div>
            </div>

            {/* Submissions & Grades list */}
            <div>
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Assessment Grades & Submissions
              </h4>
              {selectedStudent.grades?.length === 0 ? (
                <p className="text-xs text-zinc-500 italic p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  No graded assessments recorded for this student yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedStudent.grades?.map((g: any) => (
                    <div
                      key={g.id}
                      className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                          {g.assessment?.title}
                        </span>
                        <span className="text-zinc-500 font-mono">
                          {g.assessment?.moduleCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                          {g.numericGrade}%
                        </span>
                        <Badge variant="outline">{g.classification}</Badge>
                        <Badge variant={g.isPublished ? "success" : "warning"}>
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
    </div>
  );
}
