import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([
    { id: 1, name: "Project A", lastEdited: "2023-04-15" },
    { id: 2, name: "Project B", lastEdited: "2023-04-10" },
    { id: 3, name: "Project C", lastEdited: "2023-04-05" },
  ]);

  const handleNewProject = () => {
    // In a real application, you'd create a new project here
    // For now, we'll just navigate to the search page
    navigate('/search');
  };

  const handleSelectProject = (projectId) => {
    // In a real application, you'd load the selected project
    // For now, we'll just navigate to the search page
    navigate('/search');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to Holly</h1>
      <p className="mb-6 text-lg">
        Select an existing project or start a new one to begin your PubMed research journey.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
      <Button onClick={handleNewProject} className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" /> Start New Project
      </Button>
    </div>
  );
};

export default Home;