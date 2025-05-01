"use client";

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts"

import { Card } from "@/components/ui/card";

interface AssessmentPerformanceChartProps {
    data: {
        name: string;
        score: number;
        attempts: number;
    }[];
}

export const AssessmentPerformanceChart = ({
    data = []
}: AssessmentPerformanceChartProps) => {
    // If no data, show sample data
    const chartData = data.length ? data : [
        { name: "No assessment data", score: 0, attempts: 0 },
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="name" 
                    stroke="#888888"
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis 
                    stroke="#888888"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                    formatter={(value) => [`${value}%`, "Score"]}
                    labelStyle={{ color: "#333" }}
                    contentStyle={{ 
                        backgroundColor: "white", 
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                    }}
                />
                <Legend />
                <Bar 
                    name="Average Score (%)"
                    dataKey="score" 
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                />
                <Bar 
                    name="Attempts"
                    dataKey="attempts" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
} 