import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const IntroductionDraft = () => {
  const location = useLocation();
  const introductionDraft = location.state?.introductionDraft || 'No introduction draft available.';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Introduction Draft</h1>
      <Card>
        <CardHeader>
          <CardTitle>Draft Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap">{introductionDraft}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntroductionDraft;