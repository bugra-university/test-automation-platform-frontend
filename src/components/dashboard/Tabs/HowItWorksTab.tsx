import React, { useState, useRef } from "react";
import { Upload, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../ui/button";

// Types for How It Works
type Step = {
  id: number;
  title: string;
  subtitle: string;
  description: string[];
};

// How It Works steps data
const steps: Step[] = [
  {
    id: 1,
    title: "Upload Excel",
    subtitle: "Start by uploading your Excel file containing test cases and user stories. Our platform supports .xlsx files up to 10MB in size. Make sure your Excel file follows the required template structure for seamless integration.",
    description: [
      "Choose your Excel file (.xlsx)",
      "Verify file size and format",
      "Upload and process automatically"
    ]
  },
  {
    id: 2,
    title: "Connect",
    subtitle: "After uploading, your Excel data will be automatically processed and connected to our test management system. The platform ensures proper mapping of your test cases and requirements.",
    description: [
      "Automatic data processing",
      "Test case mapping",
      "Requirements linking"
    ]
  },
  {
    id: 3,
    title: "Manage",
    subtitle: "Once your data is processed, you can easily manage your test cases, track progress, and generate reports. Our intuitive interface makes test management efficient and straightforward.",
    description: [
      "Edit test cases",
      "Track test progress",
      "Generate detailed reports"
    ]
  }
];

interface HowItWorksTabProps {
  tabTitle?: string;
}

export function HowItWorksTab({ tabTitle = "How It Works" }: HowItWorksTabProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const goToPrevStep = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const goToNextStep = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  const buttonStyle = {
    borderRadius: '50%',
    aspectRatio: '1 / 1',
    width: '40px',
    height: '40px'
  };

  return (
    <div className="w-full bg-white h-full flex flex-col rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center h-[72px] px-8 border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{tabTitle}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-32 py-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-10">
            <h1 className="text-[3.5rem] font-bold mb-4 tracking-tight">How It Works</h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our simple three-step process makes it easy to get started and achieve results quickly.
            </p>
          </div>

          <div className="grid lg:grid-cols-[320px_1fr] gap-16 items-start">
            <nav className="relative flex flex-col gap-12 mx-auto lg:mx-0 max-w-xs" aria-label="Process steps">
              <div
                className="absolute left-[32px] top-6 w-0.5 bg-gray-200"
                style={{
                  height: "calc(100% - 24px)",
                  top: "12px",
                }}
                aria-hidden="true"
              />

              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`relative flex items-start text-left transition-all duration-300 group min-h-[120px]
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md p-2
                    ${activeStep === index ? "opacity-100" : "opacity-60 hover:opacity-80"}`}
                  aria-current={activeStep === index ? "step" : undefined}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`relative z-10 flex h-12 w-[12px] items-center justify-center rounded-[20px] border
                        transition-colors duration-300 flex-shrink-0
                        ${activeStep === index
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-300 bg-white group-hover:border-blue-400"}`}
                      aria-hidden="true"
                    >
                      <span className="text-[10px] font-medium">{step.id}</span>
                    </div>

                    <div className="pt-1.5 ml-4">
                      <h3
                        className={`text-lg font-semibold transition-colors duration-300
                          ${activeStep === index ? "text-gray-900" : "text-gray-500"}`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-3">{step.subtitle}</p>
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white px-10 py-8 shadow-sm min-h-[500px]">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`grid md:grid-cols-2 gap-8 transition-all duration-500 absolute inset-0 p-8 pb-20
                    ${activeStep === index
                      ? "translate-x-0 opacity-100"
                      : activeStep > index
                        ? "-translate-x-full opacity-0"
                        : "translate-x-full opacity-0"}`}
                  aria-hidden={activeStep !== index}
                  id={`step-content-${step.id}`}
                >
                  <div className="flex flex-col justify-center">
                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">{step.title}</h4>
                    <p className="text-gray-500 mb-6 leading-relaxed">{step.subtitle}</p>
                    <ul className="space-y-3">
                      {step.description.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                          <span className="text-base text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-center h-full">
                    {activeStep === 0 ? (
                      <div 
                        className={`relative flex flex-col items-center justify-center w-full h-[350px] border border-transparent rounded-xl p-6 transition-colors bg-gray-50
                          ${dragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-200'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="w-24 h-24 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                          <Upload className="w-12 h-12 text-blue-600" />
                        </div>
                        
                        <p className="mb-2 text-lg font-semibold text-gray-700">
                          Drag & drop your Excel file here
                        </p>
                        <p className="mb-4 text-sm text-gray-500">
                          or
                        </p>
                        <Button 
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Choose File
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                          {activeStep === 1 ? (
                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          ) : (
                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="absolute bottom-8 right-8 flex gap-2">
                <button
                  onClick={goToPrevStep}
                  className="!rounded-[9999px] p-2 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center [aspect-ratio:1/1]"
                  style={buttonStyle}
                  aria-label="Previous step"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <button
                  onClick={goToNextStep}
                  className="!rounded-[9999px] p-2 bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center [aspect-ratio:1/1]"
                  style={buttonStyle}
                  aria-label="Next step"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 