'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bell, BookOpen, Calendar, FileText, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome, John Doe</h1>
          <p className="text-gray-500 text-lg">
            BSc Computer Science - Semester 5
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 text-base">
          <Bell className="w-5 h-5" /> Notifications
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: <BookOpen className="w-7 h-7 text-blue-500 mb-2" />, label: "Pending Assignments", value: "3" },
          { icon: <FileText className="w-7 h-7 text-green-500 mb-2" />, label: "Graded Assignments", value: "5" },
          { icon: <TrendingUp className="w-7 h-7 text-purple-500 mb-2" />, label: "Average Grade", value: "82%" },
          { icon: <Calendar className="w-7 h-7 text-red-500 mb-2" />, label: "Upcoming Deadlines", value: "2" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 * i }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-6">
                {stat.icon}
                <p className="text-base">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Assignments Overview */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Assignments Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-base">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3">Title</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Marks</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3">Math Project</td>
                  <td>15 Aug 2025</td>
                  <td className="text-yellow-500">Pending Review</td>
                  <td>—</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3">English Essay</td>
                  <td>10 Aug 2025</td>
                  <td className="text-green-500">Graded</td>
                  <td>85%</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Graph Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Performance Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-base mb-2">
              This is a placeholder for the graph
            </p>
            <Progress value={82} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Resources */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full text-base">
              Lecture Notes
            </Button>
            <Button variant="outline" className="w-full text-base">
              Past Papers
            </Button>
            <Button variant="outline" className="w-full text-base">
              Shared Links
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
