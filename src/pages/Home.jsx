import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, Upload, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const handleBack = () => {
    console.log("Back button clicked on home page");
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now(),
        name: newProjectName.trim(),
        lastEdited: new Date().toISOString().split('T')[0]
      };
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      setNewProjectName('');
      navigate('/search', { state: { projectTitle: newProjectName.trim() } });
    } else {
      alert('Please enter a project name.');
    }
  };

  const handleSelectProject = (projectId) => {
    const selectedProject = projects.find(project => project.id === projectId);
    navigate('/search', { state: { projectTitle: selectedProject.name } });
  };

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Uploading ${type}: ${file.name}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-4xl font-bold">Welcome to Holly</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Start New Project</h2>
          <p className="mb-4">Begin your PubMed research journey with a new project.</p>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
              className="flex-grow"
            />
            <Button onClick={handleCreateProject}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Project
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSelectProject(project.id)}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Last edited: {project.lastEdited}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Existing Project or Research Articles</h2>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Upload Existing Project</CardTitle>
            </CardHeader>
            <CardContent>
              <Input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, 'project')} />
              <Button className="mt-2 w-full">
                <Upload className="mr-2 h-4 w-4" /> Upload Project PDF
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upload Research Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <Input type="file" accept=".pdf" multiple onChange={(e) => handleFileUpload(e, 'article')} />
              <Button className="mt-2 w-full">
                <Upload className="mr-2 h-4 w-4" /> Upload Research PDFs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;