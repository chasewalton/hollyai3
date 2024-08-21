import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Introduction = () => {
  const location = useLocation();
  const introduction = location.state?.introduction || 'No introduction available.';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Generated Introduction</h1>
      <Card>
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap">{introduction}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Introduction;