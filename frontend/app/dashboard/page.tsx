/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, isPast, isToday } from "date-fns";
import { CalendarIcon, Trash2, CheckCircle2, Circle, Edit2, Search, Filter } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { TaskFormModal, Task } from "@/components/TaskFormModal";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get("page") || "1";
  const searchParam = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "ALL";

  const currentPage = parseInt(pageParam, 10);

  const [data, setData] = useState<TasksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Search state
  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  
  // Delete Confirmation state
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== searchParam) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset page on search change
      router.push(`/dashboard?${params.toString()}`);
    }
  }, [debouncedSearch, searchParam, searchParams, router]);

  const handleStatusChange = (newStatus: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus && newStatus !== "ALL") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }
    params.set("page", "1"); // Reset page on filter change
    router.push(`/dashboard?${params.toString()}`);
  };

  const fetchTasks = async (page: number, search: string, status: string) => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      let url = `/tasks?page=${page}&limit=9`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status !== "ALL") url += `&status=${status}`;

      const res = await api.get(url);
      setData(res.data);
    } catch (err: any) {
      console.error(err);
      setIsError(true);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(currentPage, searchParam, statusParam);
  }, [currentPage, searchParam, statusParam]);

  const toggleTaskStatus = async (id: string, currentStatus: string) => {
    // 1. Determine next status for optimistic update
    let nextStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" = "IN_PROGRESS";
    if (currentStatus === "PENDING") nextStatus = "IN_PROGRESS";
    else if (currentStatus === "IN_PROGRESS") nextStatus = "COMPLETED";
    else if (currentStatus === "COMPLETED") nextStatus = "PENDING";

    // 2. Apply optimistic local state update
    if (data) {
      setData({
        ...data,
        tasks: data.tasks.map(t => 
          t.id === id ? { ...t, status: nextStatus } : t
        )
      });
    }

    try {
      // 3. Perform actual API call in background
      await api.patch(`/tasks/${id}/toggle`);
      // Update from server to ensure pagination and filters match new data
      fetchTasks(currentPage, searchParam, statusParam);
      toast.success("Status updated");
    } catch (err: any) {
      // 4. Revert local state on failure
      if (data) {
        setData({
          ...data,
          tasks: data.tasks.map(t => 
            t.id === id ? { ...t, status: currentStatus as any } : t
          )
        });
      }
      
      const msg = err.response?.data?.errors?.[0]?.msg || 
                  err.response?.data?.error || 
                  "Something went wrong";
      toast.error(msg);
    }
  };

  const performDelete = async () => {
    if (!deleteTaskId) return;
    try {
      await api.delete(`/tasks/${deleteTaskId}`);
      fetchTasks(currentPage, searchParam, statusParam);
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Could not delete task");
    } finally {
      setDeleteTaskId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/dashboard?${params.toString()}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 hover:bg-green-100/80 border-transparent text-xs";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-transparent text-xs";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80 border-transparent text-xs";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 hover:bg-red-100/80 border-transparent text-xs";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100/80 border-transparent text-xs";
      default:
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-transparent text-xs";
    }
  };

  const formatStatus = (status: string) => status.replace("_", " ");

  const openAddModal = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <Trash2 className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
        <p className="text-muted-foreground max-w-sm">We couldn't load your tasks. Please try again.</p>
        <Button onClick={() => fetchTasks(currentPage, searchParam, statusParam)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Task Modal component */}
      <TaskFormModal 
        open={isTaskModalOpen} 
        onOpenChange={setIsTaskModalOpen} 
        task={taskToEdit}
        onSuccess={() => fetchTasks(currentPage, searchParam, statusParam)}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your task from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={performDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your upcoming work.
          </p>
        </div>
        <Button onClick={openAddModal}>
          + Add Task
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 w-full bg-white shadow-sm"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusParam} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </CardHeader>
              <CardFooter className="mt-auto">
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : data?.tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-gray-50/50 min-h-[40vh] mt-4">
          <div className="bg-white p-6 rounded-full shadow-sm mb-4">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {searchParam || statusParam !== "ALL" ? "No matching tasks found" : "No tasks yet"}
          </h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            {searchParam || statusParam !== "ALL" 
              ? "Try adjusting your search or filters to find what you're looking for."
              : "You don't have any tasks right now. Create one to get started on your goals."}
          </p>
          {(searchParam || statusParam !== "ALL") ? (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchInput("");
                handleStatusChange("ALL");
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Button onClick={openAddModal}>
              Create your first task
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {data?.tasks.map((task) => {
              const hasDueDate = !!task.dueDate;
              const isDueOverdue = hasDueDate && isPast(new Date(task.dueDate!)) && !isToday(new Date(task.dueDate!));
              
              return (
                <Card key={task.id} className="flex flex-col hover:shadow-md transition-shadow bg-white">
                  <CardHeader className="pb-3 border-b border-muted/50">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2 max-w-[85%]">
                        <div className="flex flex-wrap gap-2 truncate">
                          <Badge 
                            key={`status-${task.status}`} 
                            variant="outline" 
                            className={`${getStatusBadgeVariant(task.status)} animate-in zoom-in duration-300`}
                          >
                            {formatStatus(task.status)}
                          </Badge>
                          <Badge variant="outline" className={getPriorityBadgeVariant(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <CardTitle className="leading-tight text-lg line-clamp-2" title={task.title}>
                          {task.title}
                        </CardTitle>
                      </div>
                      <div className="flex shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => toggleTaskStatus(task.id, task.status)}
                          title="Toggle Status"
                        >
                          {task.status === "COMPLETED" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 flex-1">
                    {task.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" title={task.description}>
                        {task.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic opacity-50">
                        No description provided.
                      </p>
                    )}
                    
                    {hasDueDate && (
                      <div className={`flex items-center gap-1.5 mt-4 text-xs font-medium ${isDueOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>{format(new Date(task.dueDate!), "MMM d, yyyy")}</span>
                        {isDueOverdue && <span className="ml-1 uppercase text-[10px] font-bold bg-red-100 px-1.5 py-0.5 rounded">Overdue</span>}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="bg-muted/30 pt-4 flex justify-end gap-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 shadow-sm bg-white"
                      onClick={() => openEditModal(task)}
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDeleteTaskId(task.id)}
                      className="h-8 bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 mt-4 border-t">
              <Button
                variant="outline"
                disabled={data.page <= 1}
                onClick={() => handlePageChange(data.page - 1)}
                className="bg-white"
              >
                Previous
              </Button>
              <div className="text-sm font-medium text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </div>
              <Button
                variant="outline"
                disabled={data.page >= data.totalPages}
                onClick={() => handlePageChange(data.page + 1)}
                className="bg-white"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
