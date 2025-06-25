import React from "react";
import { Grid } from "./grid";

export function FeaturesSectionWithCardGradient() {
  return (
    <div className="py-20 lg:py-40">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-2 max-w-7xl mx-auto">
        {grid.map((feature) => (
          <div
            key={feature.title}
            className="relative bg-gradient-to-b dark:from-neutral-900 from-neutral-100 dark:to-neutral-950 to-white p-6 rounded-3xl overflow-hidden"
          >
            <Grid size={20} />
            <p className="text-base font-bold text-neutral-800 dark:text-white relative z-20">
              {feature.title}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mt-4 text-base font-normal relative z-20">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const grid = [
  {
    title: "Test Report Generation",
    description:
      "Automatically generate comprehensive test reports with detailed analytics and insights for your testing campaigns.",
  },
  {
    title: "Real-time Test Monitoring",
    description:
      "Monitor your test execution in real-time with live updates on test status, progress, and results.",
  },
  {
    title: "Advanced Test Analytics",
    description:
      "Gain deep insights into your test performance with detailed analytics and reporting tools to measure success rates.",
  },
  {
    title: "Test Scheduling",
    description:
      "Schedule and automate your test runs across multiple environments with our intuitive scheduling system.",
  },
  {
    title: "Cross-browser Testing",
    description:
      "Execute tests across different browsers and platforms to ensure compatibility and consistent user experience.",
  },
  {
    title: "Test Case Management",
    description:
      "Organize and manage your test cases efficiently with our comprehensive test case management system.",
  },
  {
    title: "Integration Support",
    description:
      "Seamlessly integrate with your existing CI/CD pipeline and development tools for streamlined testing workflows.",
  },
  {
    title: "Team Collaboration",
    description:
      "Work collaboratively with your team using our built-in collaboration tools, allowing you to share results and provide feedback.",
  },
]; 