import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ThemeAnalysis = () => {
  const location = useLocation();
  const themes = location.state?.themes;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Theme Analysis</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recurring Themes</CardTitle>
        </CardHeader>
        <CardContent>
          {themes ? (
            <pre className="whitespace-pre-wrap">{themes}</pre>
          ) : (
            <p>No themes available. Please go back and select articles for analysis.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeAnalysis;