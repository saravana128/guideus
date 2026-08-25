import { useState, useEffect, useCallback } from "react";
import { courseService } from "../services/courseService";
import { useAuth } from "./useAuth";

export function useCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    if (!user) {
      setCourses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await courseService.listCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const createCourse = async (data) => {
    const course = await courseService.createCourse(data, user);
    setCourses((prev) => [course, ...prev]);
    return course;
  };

  const updateCourse = async (courseId, data) => {
    const updated = await courseService.updateCourse(courseId, data);
    setCourses((prev) =>
      prev.map((course) => (course.$id === courseId ? updated : course)),
    );
    return updated;
  };

  const deleteCourse = async (courseId) => {
    await courseService.deleteCourse(courseId);
    setCourses((prev) => prev.filter((course) => course.$id !== courseId));
  };

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}
