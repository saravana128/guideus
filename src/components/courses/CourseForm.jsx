import { useState, useEffect } from "react";
import { COURSE_GRADIENTS } from "../../utils/constants";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";

const blankForm = { title: "", description: "", color: "violet" };

function CourseForm({ isOpen, onClose, onSubmit, course = null }) {
  const [formData, setFormData] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = !!course;

  useEffect(() => {
    if (isOpen) {
      setFormData(
        course
          ? {
              title: course.title || "",
              description: course.description || "",
              color: course.color || "violet",
            }
          : blankForm,
      );
      setError(null);
    }
  }, [isOpen, course]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!formData.title.trim()) throw new Error("Course title is required");
      await onSubmit(formData);
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
      title={isEditing ? "Edit Course" : "Create New Course"}
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
          <Button type="submit" form="course-form" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Course" : "Create Course"}
          </Button>
        </>
      }
    >
      <form id="course-form" onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="e.g. Web Development 101"
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
            placeholder="What is this course about?"
            className="input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Theme Color
          </label>
          <div className="flex flex-wrap gap-3">
            {Object.entries(COURSE_GRADIENTS).map(([key, palette]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, color: key }))
                }
                title={palette.label}
                className={`h-10 w-10 rounded-xl bg-gradient-to-br ${palette.gradient} transition-all duration-200 ${
                  formData.color === key
                    ? "ring-2 ring-white ring-offset-2 ring-offset-surface-900 scale-110 shadow-glow"
                    : "opacity-50 hover:opacity-100 hover:scale-105"
                }`}
              />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CourseForm;
