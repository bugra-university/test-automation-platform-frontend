import React, { useState, useEffect, useRef } from "react";
import { TabContainer } from "./TabContainer";

import { ChevronDown, ChevronUp } from "lucide-react";

// Types
type Step = {
  id: number;
  title: string;
  subtitle: string;
  description: string[];
  image: string;
  imageAlt: string;
  content?: {
    title: string;
    description: string;
    features: string[];
  };
};

// Sample data - replace with your actual content
const steps: Step[] = [
  {
    id: 1,
    title: "Upload Excel",
    subtitle: "Start by uploading your Excel file containing test cases and user stories. Our platform supports .xlsx files up to 10MB in size. Make sure your Excel file follows the required template structure for seamless integration.",
    description: [
      "Choose your Excel file (.xlsx)",
      "Verify file size and format",
      "Upload and process automatically"
    ],
    image: "/placeholder.svg",
    imageAlt: "Excel upload illustration",
    content: {
      title: "Upload Excel",
      description: "Start by uploading your Excel file containing test cases and user stories. Our platform supports .xlsx files and automatically processes your data for efficient test management. The upload process is simple and secure.",
      features: [
        "Supported format: .xlsx files only",
        "Maximum file size: 10MB",
        "Secure file processing and storage"
      ]
    }
  },
  {
    id: 2,
    title: "Connect",
    subtitle:
      "Establish meaningful connections between your test cases and user stories. Our integration tools ensure that your test coverage is comprehensive while our scheduling tools make test execution effortless.",
    description: ["Link test cases to user stories", "Schedule automated test runs", "Integrate with your development workflow"],
    image: "/placeholder.svg",
    imageAlt: "Connection process illustration",
  },
  {
    id: 3,
    title: "Succeed",
    subtitle:
      "Achieve your quality goals with our comprehensive testing platform. We provide detailed analytics, progress tracking, and personalized reporting to ensure you reach your objectives efficiently and effectively.",
    description: ["Track test coverage and results", "Generate comprehensive reports", "Improve product quality continuously"],
    image: "/placeholder.svg",
    imageAlt: "Success process illustration",
  },
];

interface HowItWorksTabProps {
  tabTitle?: string;
}

export function HowItWorksTab({ tabTitle = "How It Works" }: HowItWorksTabProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance steps
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 5000); // Change step every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  // Pause animation on hover or focus
  const pauseAnimation = () => setIsPaused(true);
  const resumeAnimation = () => setIsPaused(false);

  // Handle manual step change
  const goToStep = (index: number) => {
    setActiveStep(index);
    pauseAnimation();
  };

  // Navigation controls
  const goToPrevStep = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
    pauseAnimation();
  };

  const goToNextStep = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
    pauseAnimation();
  };

  const buttonStyle = {
    borderRadius: '50%',
    aspectRatio: '1 / 1',
    width: '40px',
    height: '40px'
  };

  return (
    <TabContainer title={tabTitle}>
      <div className="px-12 py-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-[3.5rem] font-bold mb-4 tracking-tight">How It Works</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Our simple three-step process makes it easy to get started and achieve results quickly.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-12 items-start">
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
                onClick={() => goToStep(index)}
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

          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white px-10 py-8 shadow-sm min-h-[500px] max-w-2xl">
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
                  <img
                    src={step.image}
                    alt={step.imageAlt}
                    className="rounded-lg object-cover h-[80%] w-auto"
                  />
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

        <div className="flex justify-center gap-2 mt-6 lg:hidden">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors
                ${activeStep === index ? "bg-blue-500" : "bg-gray-300 hover:bg-blue-300"}`}
              aria-label={`Go to step ${index + 1}`}
              aria-current={activeStep === index ? "step" : undefined}
            />
          ))}
        </div>
      </div>
    </TabContainer>
  );
} 