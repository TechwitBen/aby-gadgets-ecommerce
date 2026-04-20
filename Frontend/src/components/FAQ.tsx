import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
 
const faqs7 = [
  { question: "How do I track my delivery?",                         answer: "You can track your delivery by logging into your account and checking the 'My Orders' section. You'll also receive SMS and email updates with tracking information." },
  { question: "How do I distinguish an authentic product?",          answer: "Visit our verification page and enter the product's unique verification code. We'll confirm whether the item is genuine or not. You can also bring items to our store for physical verification." },
  { question: "Can I order online and pick up in-store?",            answer: "Yes! We offer both trade-in services and in-store pickup at our partner locations across Nigeria. Simply select 'Store Pickup' at checkout." },
  { question: "Do you offer payment plans or installments?",         answer: "Yes, we offer flexible payment plans through our trusted financing partners. You can spread your payments over 3-12 months depending on the product." },
];
 
const FAQ = () => {
  return (
    <section className="py-10 sm:py-16 md:py-20" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="w-[92%] sm:w-[90%] mx-auto max-w-3xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center mb-8 sm:mb-10">
          Everything You Need to Know
        </h2>
 
        <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
          {faqs7.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-[hsl(200_60%_97%)] rounded-xl px-4 sm:px-6 border border-[hsl(200_60%_97%)] data-[state=open]:border-[hsl(200_60%_97%)]"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-4 sm:py-5 text-sm sm:text-base text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 sm:pb-5 text-sm leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
 
export default FAQ;
 