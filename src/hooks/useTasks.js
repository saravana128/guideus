import { useState, useEffect, useCallback } from "react";
import { taskService } from "../services/taskService";
import { useAuth } from "./useAuth";

// Keep the list ordered by soonest due date first (matches taskService.listTasks)
const sortByDueDate = (list) =>
  [...list].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

export function useTasks(filters = {}) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await taskService.listTasks(filters);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const replaceTask = (updated) =>
    setTasks((prev) =>
      sortByDueDate(
        prev.map((task) => (task.$id === updated.$id ? updated : task)),
      ),
    );

  const createTask = async (taskData) => {
    const newTask = await taskService.createTask(taskData, user);
    setTasks((prev) => sortByDueDate([...prev, newTask]));
    return newTask;
  };

  const updateTask = async (taskId, taskData) => {
    const updated = await taskService.updateTask(taskId, taskData);
    replaceTask(updated);
    return updated;
  };

  const updateStatus = async (task, status) => {
    const updated = await taskService.updateTaskStatus(task.$id, status);
    replaceTask(updated);
    return updated;
  };

  const updateDueDate = async (task, dueDate) => {
    const updated = await taskService.updateTaskDueDate(task.$id, dueDate);
    replaceTask(updated);
    return updated;
  };

  const toggleComplete = async (task) => {
    const updated = await taskService.toggleComplete(task);
    replaceTask(updated);
    return updated;
  };

  const deleteTask = async (task) => {
    await taskService.deleteTask(task.$id, task.imageUrl);
    setTasks((prev) => prev.filter((t) => t.$id !== task.$id));
  };

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    updateStatus,
    updateDueDate,
    toggleComplete,
    deleteTask,
  };
}
