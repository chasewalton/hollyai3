import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const Project = () => {
  const navigate = useNavigate();
  const projectName = "My Research Project"; // This should be dynamically set based on the actual project

  const projectSections = [
    { id: 1, title: "Introduction", status: "Complete" },
    { id: 2, title: "Literature Review", status: "In Progress" },
    { id: 3, title: "Methodology", status: "Not Started" },
    { id: 4, title: "Results", status: "Not Started" },
    { id: 5, title: "Discussion", status: "Not Started" },
    { id: 6, title: "Conclusion", status: "Not Started" },
  ];

  const handleBack = () => {
    navigate('/');
  };

  const handleSectionClick = (sectionId) => {
    // Navigate to the specific section page
    navigate(`/project/section/${sectionId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold">{projectName}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectSections.map((section) => (
          <Card 
            key={section.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSectionClick(section.id)}
          >
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Status: {section.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Project;