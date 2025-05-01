"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentSelector } from "./student-selector";
import { StudentPerformance } from "./student-performance";
import { EnrollmentChart } from "./enrollment-chart";

export function StudentSelectorWrapper() {
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    
    return (
        <>
            <StudentSelector onSelectStudent={setSelectedStudentId} />
            <StudentPerformance studentId={selectedStudentId} />
            {selectedStudentId && (
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Learning Progress</CardTitle>
                            <CardDescription>Student's learning progress over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EnrollmentChart studentId={selectedStudentId} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
} 