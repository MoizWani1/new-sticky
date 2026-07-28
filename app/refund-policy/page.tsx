
import React from 'react';

export default function RefundPolicy() {
    return (
        <div className="min-h-screen px-4 py-32 md:px-6">
            <div className="max-w-4xl mx-auto container">
                <div className="bg-white border-2 border-black/5 p-8 md:p-12 rounded-3xl shadow-sm">
                    <h1 className="text-4xl font-display font-bold mb-8 text-foreground uppercase tracking-wide">Cancellation, Return & Refund Policy</h1>

                    <section className="mb-8 border-b-2 border-black/5 pb-8">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">1. Order Cancellations</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You may cancel your order at any time before it has been shipped. Once the order has been dispatched, it cannot be cancelled.
                            To cancel an order, please contact us immediately at <a href="mailto:Moizwani6@gmail.com" className="text-[hsl(var(--primary))] font-bold hover:text-foreground transition-colors underline">Moizwani6@gmail.com</a>.
                        </p>
                    </section>

                    <section className="mb-8 border-b-2 border-black/5 pb-8">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">2. Returns</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We accept returns within 7 days of delivery. To be eligible for a return, your item must be unused, in the same condition that you received it, and in the original packaging.
                        </p>
                        <p className="mt-4 text-muted-foreground leading-relaxed bg-primary/5 p-4 rounded-xl border-2 border-primary/20">
                            <strong className="text-foreground">Non-returnable items:</strong> Custom or personalized items, and items on final sale.
                        </p>
                    </section>

                    <section className="mb-8 border-b-2 border-black/5 pb-8">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">3. Refunds</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
                            If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.
                        </p>
                    </section>

                    <section className="mb-0">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">4. Exhaustive Exchanges</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at <a href="mailto:Moizwani6@gmail.com" className="text-[hsl(var(--primary))] font-bold hover:text-foreground transition-colors underline">Moizwani6@gmail.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
