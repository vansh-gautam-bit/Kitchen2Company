import { Lightbulb, Compass, Rocket } from "lucide-react";

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
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest">
            How It Works
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
            From idea to launch in three simple steps
          </h2>
          <p className="mt-6 text-lg text-text-muted">
            No paperwork headaches. No confusion. Just a clear path forward.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative rounded-3xl bg-white p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border-subtle hover:border-emerald-200"
              >
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}