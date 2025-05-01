"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface StudentData {
  id: string;
  name: string;
  email: string;
  enrolledCourses: number;
  assessmentsTaken: number;
}

interface StudentSelectorProps {
  onSelectStudent: (studentId: string | null) => void;
}

export const StudentSelector = ({ onSelectStudent }: StudentSelectorProps) => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        // Fetch enrolled students for this teacher
        const response = await axios.get("/api/analytics/students");
        
        if (response.data && Array.isArray(response.data.students)) {
          setStudents(response.data.students);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleChange = (value: string) => {
    setSelectedId(value);
    onSelectStudent(value);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-medium">Select Student</h3>
        {students.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {students.length} students enrolled
          </Badge>
        )}
      </div>
      
      <Select
        disabled={isLoading || students.length === 0}
        onValueChange={handleChange}
        value={selectedId || undefined}
      >
        <SelectTrigger className="w-full md:w-[300px]">
          <SelectValue placeholder={
            isLoading 
              ? "Loading students..." 
              : students.length === 0 
                ? "No enrolled students" 
                : "Select a student"
          } />
        </SelectTrigger>
        <SelectContent>
          {students.map((student) => (
            <SelectItem key={student.id} value={student.id}>
              <div className="flex flex-col">
                <span>{student.name}</span>
                <span className="text-xs text-muted-foreground">{student.email}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedId && students.length > 0 && (
        <div className="mt-3 flex gap-3">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
            {students.find(s => s.id === selectedId)?.enrolledCourses || 0} Courses
          </Badge>
          <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
            {students.find(s => s.id === selectedId)?.assessmentsTaken || 0} Assessments
          </Badge>
        </div>
      )}
    </div>
  );
}; 