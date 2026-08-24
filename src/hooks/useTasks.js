import { useState, useEffect, useCallback } from "react";
import { taskService } from "../services/taskService";
import { useAuth } from "./useAuth";

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
      const data = await taskService.listTasks(user.$id, filters);
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

  const createTask = async (taskData) => {
    const newTask = await taskService.createTask(taskData, user.$id);
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = async (taskId, taskData, existingImageUrl) => {
    const updated = await taskService.updateTask(
      taskId,
      taskData,
      existingImageUrl,
    );
    setTasks((prev) =>
      prev.map((task) => (task.$id === taskId ? updated : task)),
    );
    return updated;
  };

  const toggleComplete = async (task) => {
    const updated = await taskService.toggleComplete(task);
    setTasks((prev) => prev.map((t) => (t.$id === task.$id ? updated : t)));
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
    toggleComplete,
    deleteTask,
  };
}
