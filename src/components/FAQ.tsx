import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "./ui";

const faqs = [
  {
    question: "Do I really need a license to cook from home?",
    answer:
      "Yes. In India, any home-based food business must register with FSSAI (Food Safety and Standards Authority of India). Depending on your annual turnover, you need either a Basic Registration (up to \u20b912 lakh) or a State/Central License. Operating without one can result in fines and closure.",
  },
  {
    question: "What business structure should I choose?",
    answer:
      "Most home chefs start as a Sole Proprietorship, which is the simplest. However, if you plan to raise funding or scale, registering as a Private Limited Company or One Person Company (OPC) may be better. Kitchen2Company helps you decide based on your goals.",
  },
  {
    question: "How is Kitchen2Company different from a CA or consultant?",
    answer:
      "While CAs and consultants provide general business advice, Kitchen2Company is purpose-built for the food industry. Our AI-powered platform gives you a personalised roadmap covering FSSAI, GST, brand registration (TM), label compliance, and local health permits \u2014 all in one place.",
  },
  {
    question: "How much does it cost to start a food business legally?",
    answer:
      "Costs vary widely depending on your state, business structure, and scale. A basic FSSAI registration costs around \u20b9100-500, while a full setup including GST, trademark, and professional help can range from \u20b95,000 to \u20b925,000. Your personalised roadmap will include a transparent cost breakdown.",
  },
  {
    question: "Can I use my home kitchen, or do I need a separate space?",
    answer:
      "In many cases, you can start from your home kitchen. However, FSSAI requires that your kitchen meets basic hygiene and infrastructure standards \u2014 proper ventilation, tiled surfaces, separate storage, and pest control. If you pass the inspection, you are good to go.",
  },
  {
    question: "How long does the registration process take?",
    answer:
      "FSSAI Basic Registration can be completed in 7\u201315 days. State and central licenses take 30\u201360 days depending on your location and documentation. Your personalised roadmap will show estimated timelines for every step so you can plan ahead.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-bg-warm py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Got questions? We've got answers."
          subtitle="Everything you need to know about starting your food business legally in India."
        />

        {/* FAQ items */}
        <div className="mx-auto mt-16 max-w-3xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border bg-white transition-all duration-200 ${
                  isOpen
                    ? "border-emerald-200 shadow-md shadow-emerald-100/20"
                    : "border-border-subtle hover:border-emerald-100 hover:shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-text-primary pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-text-muted transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-6 pb-5 text-base text-text-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}