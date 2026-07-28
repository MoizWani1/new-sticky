import React from 'react';

export default function FAQs() {
    const faqs = [
        {
            question: "What makes StickyBits stickers different?",
            answer: "We use premium, high-durability vinyl and offer three awesome finish types to choose from: Glossy, Matte, and Vinyl. Every design is curated for maximum pop culture impact."
        },
        {
            question: "How long does shipping take?",
            answer: "Standard orders usually process within 24 hours. However, if you order custom stickers, it might take a little longer to get them printed perfectly. Delivery across Pakistan takes 3-5 business days."
        },
        {
            question: "Do you offer international shipping?",
            answer: "Currently, we only ship within Pakistan, but global domination is on our roadmap. Stay tuned!"
        },
        {
            question: "Can I track my order?",
            answer: "Yes! Once your order is dispatched, you'll receive a tracking link via email and SMS."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 7-day return policy for unused items in their original packaging. Check out our Refund Policy page for all the details."
        },
        {
            question: "Do you make custom stickers?",
            answer: "Absolutely! Whether you want 1 sticker or 100, we can make them for you. Just send us a DM on Instagram @stickybitsOfficial with your request and we'll get it sorted!"
        },
        {
            question: "Are your stickers really waterproof?",
            answer: "100%. Stick them on your laptop, your water bottle, or your car. They can handle the rain, the spills, and the tears of your enemies."
        },
        {
            question: "How do I apply the stickers perfectly?",
            answer: "Clean the surface, dry it completely, peel the backing, and apply smoothly from one edge to the other to avoid air bubbles. Voila!"
        },
        {
            question: "What payment methods do you accept?",
            answer: "Currently, we offer Cash on Delivery (COD), Bank Transfers, and Wallet Transfers (JazzCash/EasyPaisa). Whatever is easiest for you!"
        },
        {
            question: "How can I contact customer support?",
            answer: "You can reach us anytime at Moizwani6@gmail.com. Our support team is super friendly and ready to help!"
        }
    ];

    return (
        <div className="min-h-screen px-4 py-32 md:px-6">
            <div className="max-w-4xl mx-auto container">
                <div className="bg-white border-2 border-black/5 p-8 md:p-12 rounded-3xl shadow-sm">
                    <h1 className="text-4xl font-display font-bold mb-8 text-foreground uppercase tracking-wide text-center">Frequently Asked Questions</h1>

                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/10">
                                <h3 className="text-xl font-display font-bold mb-3 text-primary">{faq.question}</h3>
                                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center border-t-2 border-black/5 pt-8">
                        <p className="text-muted-foreground">
                            Still have questions? <a href="mailto:Moizwani6@gmail.com" className="text-[hsl(var(--primary))] font-bold hover:text-foreground transition-colors underline">Contact Us</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
