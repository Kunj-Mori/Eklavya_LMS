"use client";

import { useEffect, useState } from "react";
import {
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts"
import axios from "axios";

interface EnrollmentChartProps {
    studentId?: string;
}

export const EnrollmentChart = ({ studentId }: EnrollmentChartProps) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setLoading(true);
                
                if (!studentId) {
                    setData([]);
                    setLoading(false);
                    return;
                }
                
                // Fetch real enrollment data for the selected student
                const response = await axios.get(`/api/analytics/student/${studentId}`);
                
                if (response.data && response.data.enrollmentData) {
                    setData(response.data.enrollmentData);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error("Error fetching student enrollment data:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStudentData();
    }, [studentId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[350px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }
    
    if (!studentId) {
        return (
            <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                <p>Please select a student to view their enrollment data</p>
            </div>
        );
    }
    
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                <p>No enrollment data available for this student</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="month" 
                    stroke="#888888"
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis 
                    stroke="#888888"
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    contentStyle={{ 
                        backgroundColor: "white", 
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                    }}
                />
                <Legend />
                <Line 
                    type="monotone" 
                    name="Course Progress"
                    dataKey="progress" 
                    stroke="#4f46e5" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                />
                <Line 
                    type="monotone" 
                    name="Assessment Scores"
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
} 