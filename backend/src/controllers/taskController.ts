import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { PrismaClient, Prisma, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient({});

export async function getTasks(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  try {
    const where: Prisma.TaskWhereInput = { userId };

    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      where.status = status as TaskStatus;
    }

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count({ where }),
    ]);

    res.status(200).json({
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createTask(req: Request, res: Response): Promise<void> {

  const userId = req.userId!;
  const { title, description, status, priority, dueDate } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        status: status ?? undefined,
        priority: priority ?? undefined,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
      },
    });

    res.status(201).json({ task });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTaskById(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const id = req.params.id as string;

  try {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(200).json({ task });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateTask(req: Request, res: Response): Promise<void> {

  const userId = req.userId!;
  const id = req.params.id as string;
  const { title, description, status, priority, dueDate } = req.body;

  try {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });

    res.status(200).json({ task });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const id = req.params.id as string;

  try {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function toggleTaskStatus(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const id = req.params.id as string;

  try {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    let newStatus: TaskStatus = TaskStatus.PENDING;
    if (existing.status === TaskStatus.PENDING) newStatus = TaskStatus.IN_PROGRESS;
    else if (existing.status === TaskStatus.IN_PROGRESS) newStatus = TaskStatus.COMPLETED;

    const task = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });

    res.status(200).json({ task });
  } catch (error) {
    console.error("Toggle task error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
