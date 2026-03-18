"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasks = getTasks;
exports.createTask = createTask;
exports.getTaskById = getTaskById;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
exports.toggleTaskStatus = toggleTaskStatus;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({});
async function getTasks(req, res) {
    const userId = req.userId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const status = req.query.status;
    const search = req.query.search;
    try {
        const where = { userId };
        if (status && Object.values(client_1.TaskStatus).includes(status)) {
            where.status = status;
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
    }
    catch (error) {
        console.error("Get tasks error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function createTask(req, res) {
    const userId = req.userId;
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
    }
    catch (error) {
        console.error("Create task error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function getTaskById(req, res) {
    const userId = req.userId;
    const id = req.params.id;
    try {
        const task = await prisma.task.findFirst({ where: { id, userId } });
        if (!task) {
            res.status(404).json({ error: "Task not found" });
            return;
        }
        res.status(200).json({ task });
    }
    catch (error) {
        console.error("Get task error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function updateTask(req, res) {
    const userId = req.userId;
    const id = req.params.id;
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
    }
    catch (error) {
        console.error("Update task error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function deleteTask(req, res) {
    const userId = req.userId;
    const id = req.params.id;
    try {
        const existing = await prisma.task.findFirst({ where: { id, userId } });
        if (!existing) {
            res.status(404).json({ error: "Task not found" });
            return;
        }
        await prisma.task.delete({ where: { id } });
        res.status(200).json({ message: "Task deleted" });
    }
    catch (error) {
        console.error("Delete task error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function toggleTaskStatus(req, res) {
    const userId = req.userId;
    const id = req.params.id;
    try {
        const existing = await prisma.task.findFirst({ where: { id, userId } });
        if (!existing) {
            res.status(404).json({ error: "Task not found" });
            return;
        }
        let newStatus = client_1.TaskStatus.PENDING;
        if (existing.status === client_1.TaskStatus.PENDING)
            newStatus = client_1.TaskStatus.IN_PROGRESS;
        else if (existing.status === client_1.TaskStatus.IN_PROGRESS)
            newStatus = client_1.TaskStatus.COMPLETED;
        const task = await prisma.task.update({
            where: { id },
            data: { status: newStatus },
        });
        res.status(200).json({ task });
    }
    catch (error) {
        console.error("Toggle task error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
//# sourceMappingURL=taskController.js.map