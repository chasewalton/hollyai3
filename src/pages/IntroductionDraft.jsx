import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const IntroductionDraft = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [introductionDraft, setIntroductionDraft] = useState('');
  const [steps, setSteps] = useState([
    { name: 'Hybrid Retrieval-Generation Models', progress: 0, speed: 0.5, description: 'Retrieving relevant information from PDFs and generating initial content.' },
    { name: 'Knowledge-Enhanced Text Generation', progress: 0, speed: 0.8, description: 'Using extracted knowledge to generate factually accurate text with in-line citations.' },
    { name: 'Memory-Augmented Neural Networks (MANNs)', progress: 0, speed: 0.6, description: 'Storing and accessing information from multiple PDFs to effectively combine information from different sources.' },
    { name: 'Attention Mechanisms', progress: 0, speed: 0.7, description: 'Focusing on the most relevant parts of the text within PDFs to identify key points and determine citation placement.' },
    { name: 'Content Extraction', progress: 0, description: 'Extracting key concepts, quotes, and summaries from the retrieved information.' },
    { name: 'Draft Generation', progress: 0, description: 'Generating the introduction draft using the extracted content.' },
    { name: 'Final Refinement', progress: 0, description: 'Refining and polishing the generated draft for coherence and clarity.' }
  ]);

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const processSteps = async () => {
      for (let i = 0; i < 4; i++) {
        await processVariableStep(i);
      }
      for (let i = 4; i < steps.length; i++) {
        await processFixedStep(i);
      }
      setIntroductionDraft(location.state?.introductionDraft || 'Introduction draft generated successfully.');
    };

    processSteps();
  }, [location.state?.introductionDraft]);

  const processVariableStep = async (stepIndex) => {
    const step = steps[stepIndex];
    const totalIterations = 100;
    for (let i = 0; i <= totalIterations; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 / step.speed));
      const progress = Math.min((i / totalIterations) * 100, 100);
      setSteps(prevSteps => prevSteps.map((s, index) => 
        index === stepIndex ? { ...s, progress } : s
      ));
      if (progress >= 100) break;
    }
  };

  const processFixedStep = async (stepIndex) => {
    const totalIterations = 10;
    for (let i = 0; i <= totalIterations; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSteps(prevSteps => prevSteps.map((step, index) => 
        index === stepIndex ? { ...step, progress: (i / totalIterations) * 100 } : step
      ));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold">Introduction Draft</h1>
      </div>
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