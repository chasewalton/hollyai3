import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const IntroductionDraft = () => {
  const location = useLocation();
  const [introductionDraft, setIntroductionDraft] = useState('');
  const [steps, setSteps] = useState([
    { name: 'Hybrid Retrieval-Generation Models', progress: 0, description: 'Retrieving relevant information from PDFs and generating initial content.' },
    { name: 'Knowledge-Enhanced Text Generation', progress: 0, description: 'Using extracted knowledge to generate factually accurate text with in-line citations.' },
    { name: 'Memory-Augmented Neural Networks (MANNs)', progress: 0, description: 'Storing and accessing information from multiple PDFs to effectively combine information from different sources.' },
    { name: 'Content Extraction', progress: 0, description: 'Extracting key concepts, quotes, and summaries from the retrieved information.' },
    { name: 'Draft Generation', progress: 0, description: 'Generating the introduction draft using the extracted content.' },
    { name: 'Final Refinement', progress: 0, description: 'Refining and polishing the generated draft for coherence and clarity.' }
  ]);

  useEffect(() => {
    const simulateProgress = () => {
      setSteps(prevSteps => 
        prevSteps.map((step, index) => {
          if (step.progress < 100) {
            return { ...step, progress: Math.min(step.progress + Math.random() * 10, 100) };
          }
          return step;
        })
      );
    };

    const interval = setInterval(simulateProgress, 500);

    // Simulating the completion of the process
    setTimeout(() => {
      clearInterval(interval);
      setSteps(prevSteps => prevSteps.map(step => ({ ...step, progress: 100 })));
      setIntroductionDraft(location.state?.introductionDraft || 'No introduction draft available.');
    }, 10000);

    return () => clearInterval(interval);
  }, [location.state?.introductionDraft]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Introduction Draft</h1>
      <div className="flex gap-6">
        <div className="w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Generation Process</CardTitle>
            </CardHeader>
            <CardContent>
              {steps.map((step, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">{step.name}</span>
                    <span>{Math.round(step.progress)}%</span>
                  </div>
                  <Progress value={step.progress} className="mb-2" />
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Draft Introduction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">
                {introductionDraft || 'Generating introduction...'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntroductionDraft;