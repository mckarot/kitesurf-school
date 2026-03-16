// src/hooks/useCourses.ts

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { Course, CreateCourseInput } from '../types';

interface UseCoursesReturn {
  courses: Course[];
  isLoading: boolean;
  error: Error | null;
  createCourse: (input: CreateCourseInput) => Promise<void>;
  updateCourse: (id: number, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
  refreshCourses: () => Promise<void>;
}

export function useCourses(): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await db.courses.toArray();
      setCourses(loaded);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to load courses');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charge les cours au montage du hook
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const createCourse = useCallback(async (input: CreateCourseInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const courseToAdd = {
        instructorId: input.instructorId,
        title: input.title,
        description: input.description,
        level: input.level,
        maxStudents: input.maxStudents,
        price: input.price,
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      };
      // Dexie ajoute l'id automatiquement grâce à ++id dans le schema
      await db.courses.add(courseToAdd as any);
      await loadCourses();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to create course');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadCourses]);

  const updateCourse = useCallback(async (id: number, updates: Partial<Course>) => {
    setIsLoading(true);
    setError(null);
    try {
      await db.courses.update(id, updates);
      await loadCourses();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to update course');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadCourses]);

  const deleteCourse = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Hard delete : supprime réellement le cours de la base
      await db.courses.delete(id);
      await loadCourses();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to delete course');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadCourses]);

  const refreshCourses = useCallback(async () => {
    await loadCourses();
  }, [loadCourses]);

  return { courses, isLoading, error, createCourse, updateCourse, deleteCourse, refreshCourses };
}
