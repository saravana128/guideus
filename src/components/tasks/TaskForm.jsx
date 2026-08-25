import { useState, useEffect, useRef } from "react";
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  SELECTABLE_STATUSES,
} from "../../utils/constants";
import { storageService } from "../../services/storageService";
import { courseService } from "../../services/courseService";
import { profileService } from "../../services/profileService";
import { useAuth } from "../../hooks/useAuth";
import { toDateTimeLocalValue } from "../../utils/helpers";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";

const blankForm = (userId, courseId) => ({
  title: "",
  description: "",
  status: TASK_STATUS.PENDING,
  dueDate: "",
  courseId: courseId || "",
  assignedTo: userId || "",
  imageUrl: null,
});

function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  task = null,
  defaultCourseId = "",
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(blankForm("", ""));
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const isEditing = !!task;

  // Load courses + the shared user directory for the selects
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    (async () => {
      try {
        const [courseList, profileList] = await Promise.all([
          courseService.listCourses(),
          profileService.listProfiles(),
        ]);
        if (cancelled) return;
        setCourses(courseList);
        const merged = [...profileList];
        if (user && !merged.some((p) => p.userId === user.$id)) {
          merged.unshift({
            userId: user.$id,
            name: user.name || user.email,
            email: user.email,
          });
        }
        merged.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setUsers(merged);
      } catch {
        // Selects will just be empty
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        const status =
          task.completed || task.rawStatus === TASK_STATUS.COMPLETED
            ? TASK_STATUS.COMPLETED
            : task.rawStatus || TASK_STATUS.PENDING;
        setFormData({
          title: task.title || "",
          description: task.description || "",
          status,
          dueDate: toDateTimeLocalValue(task.dueDate),
          courseId: task.courseId || defaultCourseId || "",
          assignedTo: task.assignedTo || user?.$id || "",
          imageUrl: task.imageUrl || null,
        });
        setImagePreview(
          task.imageUrl ? storageService.getImageUrl(task.imageUrl) : null,
        );
      } else {
        setFormData(blankForm(user?.$id, defaultCourseId));
        setImagePreview(null);
      }
      setImageFile(null);
      setError(null);
    }
  }, [isOpen, task, defaultCourseId, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!formData.title.trim()) throw new Error("Title is required");
      if (!formData.dueDate) throw new Error("Due date is required");
      if (!formData.courseId) throw new Error("Please pick a course");

      const assignee = users.find((u) => u.userId === formData.assignedTo);
      const data = {
        ...formData,
        assignedTo: formData.assignedTo || user?.$id,
        assignedToName: assignee?.name || user?.name || "Me",
      };
      if (imageFile) {
        data.imageUrl = await storageService.uploadImage(imageFile);
      }
      await onSubmit(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Task" : "Create New Task"}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="task-form" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <Input
          label="Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          required
        />

        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Enter task description"
            className="input resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Course *
            </label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="" disabled>
                Select a course
              </option>
              {courses.map((course) => (
                <option key={course.$id} value={course.$id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Assign To
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="input"
            >
              {users.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.userId === user?.$id ? `🙋 ${u.name} (me)` : u.name}
                  {u.email ? ` — ${u.email}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Due Date *"
            name="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
            >
              {SELECTABLE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            Reference Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-surface-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-500/15 file:text-primary-300 hover:file:bg-primary-500/25 file:transition-colors file:cursor-pointer"
          />
          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-xl border border-white/10"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-rose-500 shadow-lg"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default TaskForm;

