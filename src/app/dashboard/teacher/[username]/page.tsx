"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableHead, TableBody, TableRow, TableHeader } from "@/components/ui/table";
import { Search, Settings, PlusSquare, Download } from "lucide-react";

// Mock data
const stats = [
  { id: 1, label: "Total Submissions", value: "1,245" },
  { id: 2, label: "Graded", value: "1,180" },
  { id: 3, label: "Plagiarism Flags", value: "24" },
  { id: 4, label: "Avg. Score", value: "82%" },
];

const submissions = [
  { id: 1, student: "Ali Khan", title: "AI Project Report", status: "Graded", grade: "A", date: "Aug 5, 2025" },
  { id: 2, student: "Sara Ahmed", title: "Data Science Essay", status: "Pending", grade: "-", date: "Aug 7, 2025" },
  { id: 3, student: "Bilal Aslam", title: "Networking Lab", status: "Graded", grade: "B+", date: "Aug 6, 2025" },
  { id: 4, student: "Hina Rauf", title: "Software Design", status: "Under Review", grade: "-", date: "Aug 8, 2025" },
];

export default function DashboardPreview() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="flex items-center justify-between gap-4 p-4 bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-violet-600">GradeX Dashboard</h2>
          <div className="hidden sm:flex items-center bg-gray-100 rounded-md px-2 py-1 gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input className="w-64 bg-transparent border-0 p-0" placeholder="Search students or assignments" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex"><PlusSquare className="mr-2" />New Assignment</Button>
          <Button variant="ghost"><Download className="mr-2" />Export</Button>
          <div className="flex items-center gap-2">
            <Avatar>
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-violet-600 text-white">T</span>
            </Avatar>
            <div className="text-sm text-gray-700">Teacher A</div>
            <Settings className="w-5 h-5 text-gray-500 ml-2" />
          </div>
        </div>
      </header>

      <main className="p-6 md:p-8">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <Card key={s.id} className="bg-white">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{s.label}</div>
                    <div className="text-2xl font-semibold mt-1">{s.value}</div>
                  </div>
                  <div className="text-violet-600 text-3xl font-bold">{s.id === 4 ? "📈" : "📄"}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Submissions */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Submissions</h3>
                  <div className="text-sm text-gray-500">Showing latest 10</div>
                </div>

                <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-gray-600 text-sm">
                      <th className="py-2">Student</th>
                      <th className="py-2">Assignment</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Grade</th>
                      <th className="py-2">Submitted</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="py-3">{row.student}</td>
                        <td className="py-3 text-gray-700">{row.title}</td>
                        <td className={`py-3 font-medium ${row.status === 'Graded' ? 'text-green-600' : row.status === 'Pending' ? 'text-yellow-600' : 'text-violet-600'}`}>{row.status}</td>
                        <td className="py-3">{row.grade}</td>
                        <td className="py-3 text-gray-500">{row.date}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button size="sm">View</Button>
                            <Button variant="outline" size="sm">Grade</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="outline">Invite Students</Button>
              <Button>Upload Template</Button>
              <Button variant="ghost">Generate Report</Button>
            </div>
          </div>

          {/* Right column: Charts & Alerts */}
          <div className="space-y-4">
            <Card>
              <CardContent>
                <h4 className="font-semibold mb-3">Average Scores (by class)</h4>
                {/* Simple bar chart using divs */}
                <div className="space-y-3">
                  {['CS101','DS201','AI301','NW110'].map((c, i) => (
                    <div key={c} className="flex items-center gap-3">
                      <div className="w-20 text-sm text-gray-600">{c}</div>
                      <div className="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
                        <div className={`h-3 rounded bg-violet-600`} style={{ width: `${60 + i*8}%` }} />
                      </div>
                      <div className="w-12 text-sm text-gray-700 text-right">{60 + i*8}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h4 className="font-semibold mb-3">Notifications</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• 5 new submissions waiting for review</li>
                  <li>• 2 plagiarism alerts in last 24 hours</li>
                  <li>• Scheduled maintenance on Aug 20, 2025</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
