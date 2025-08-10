'use client'
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { LogIn, GraduationCap, ShieldCheck, BarChart3 } from "lucide-react";



export default function Home() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  return (
     <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 shadow-sm bg-white sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-600">GradeX</h1>
        <nav className="hidden md:flex gap-6 text-gray-600 font-medium">
          <a href="#features" className="hover:text-blue-600">Features</a>
          <a href="#how" className="hover:text-blue-600">How It Works</a>
          <a href="#contact" className="hover:text-blue-600">Contact</a>
        </nav>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2"><LogIn size={18}/> Login</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Login to GradeX</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button>Continue</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-12 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl text-center md:text-left"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">AI-Powered Assignment Grading</h2>
          <p className="mt-4 text-gray-600">Save hours of manual work. Get instant feedback, plagiarism detection, and performance analytics — all in one platform.</p>
          <div className="mt-6 flex gap-4 justify-center md:justify-start">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">Book a Demo</Button>
          </div>
        </motion.div>
        <motion.img
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          src="/dashboard-mockup.png"
          alt="Dashboard Preview"
          className="w-full md:w-1/2 rounded-lg shadow-lg"
        />
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 md:px-16 py-16 bg-white">
        <h3 className="text-3xl font-bold text-center mb-12">Features</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-md">
            <CardContent className="flex flex-col items-center text-center py-8">
              <GraduationCap className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">AI Auto-Grading</h4>
              <p className="text-gray-600">Grade assignments in seconds with AI-powered evaluation.</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardContent className="flex flex-col items-center text-center py-8">
              <ShieldCheck className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Plagiarism Detection</h4>
              <p className="text-gray-600">Ensure originality with integrated plagiarism checks.</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardContent className="flex flex-col items-center text-center py-8">
              <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Analytics</h4>
              <p className="text-gray-600">Track student performance trends over time.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="px-6 md:px-16 py-16 bg-gray-50">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-blue-600 font-bold text-2xl mb-2">1</div>
            <h4 className="font-semibold mb-2">Upload</h4>
            <p className="text-gray-600">Students submit PDF or DOCX files securely.</p>
          </div>
          <div>
            <div className="text-blue-600 font-bold text-2xl mb-2">2</div>
            <h4 className="font-semibold mb-2">Analyze</h4>
            <p className="text-gray-600">AI grades & checks plagiarism instantly.</p>
          </div>
          <div>
            <div className="text-blue-600 font-bold text-2xl mb-2">3</div>
            <h4 className="font-semibold mb-2">Review & Publish</h4>
            <p className="text-gray-600">Teachers finalize and publish results.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center py-6 mt-auto">
        <p>© {new Date().getFullYear()} GradeX. All rights reserved.</p>
      </footer>
    </div>
  );
}
