import { Lightbulb, Compass, Rocket } from "lucide-react";
import { SectionHeading, Card } from "./ui";

const steps = [
  {
    icon: Lightbulb,
    title: "Tell Us Your Idea",
    description:
      "Answer a few simple questions about your food business idea — what you want to cook, where you are, and your goals.",
    number: "01",
  },
  {
    icon: Compass,
    title: "Get Personalized Guidance",
    description:
      "Receive a step-by-step launch roadmap covering FSSAI licensing, business registration, GST, and local permits tailored to your state.",
    number: "02",
  },
  {
    icon: Rocket,
    title: "Launch With Confidence",
    description:
      "Follow your custom plan with checklists, timeline estimates, and cost breakdowns so nothing falls through the cracks.",
    number: "03",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-bg-warm py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="How It Works"
          title="From idea to launch in three simple steps"
          subtitle="No paperwork headaches. No confusion. Just a clear path forward."
        />

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} hover className="group relative p-8">
                {/* Number */}
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-emerald-100/60 select-none">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-gradient-emerald group-hover:text-white transition-all duration-300">
                  <Icon size={28} />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-bold text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-3 text-base text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}