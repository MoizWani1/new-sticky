
import React from 'react';

export default function TermsConditions() {
    return (
        <div className="min-h-screen px-4 py-32 md:px-6">
            <div className="max-w-4xl mx-auto container">
                <div className="bg-white border-2 border-black/5 p-8 md:p-12 rounded-3xl shadow-sm">
                    <h1 className="text-4xl font-display font-bold mb-6 text-foreground uppercase tracking-wide">Terms and Conditions</h1>
                    <p className="mb-8 text-muted-foreground font-medium">Last Updated: {new Date().toLocaleDateString()}</p>

                    <section className="mb-8 border-b-2 border-black/5 pb-8">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">1. Agreement to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing and using StickyBits, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our website.
                        </p>
                    </section>

                    <section className="mb-8 border-b-2 border-black/5 pb-8">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">2. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The content, organization, graphics, design, compilation, and other matters related to the Site are protected under applicable copyrights, trademarks, and other proprietary (including but not limited to intellectual property) rights.
                            The copying, redistribution, use, or publication by you of any such matters or any part of the Site is strictly prohibited.
                        </p>
                    </section>

                    <section className="mb-8 border-b-2 border-black/5 pb-8">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">3. Products and Pricing</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We ensure that all details, descriptions, and prices of products appearing on the website are accurate. However, errors may occur. If we discover an error in the price of any goods which you have ordered, we will inform you of this as soon as possible.
                        </p>
                    </section>

                    <section className="mb-8 border-b-2 border-black/5 pb-8">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">4. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            StickyBits shall not be liable for any special or consequential damages that result from the use of, or the inability to use, the materials on this site or the performance of the products.
                        </p>
                    </section>

                    <section className="mb-0">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">5. Contact Information</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Questions about the Terms and Conditions should be sent to us at: <a href="mailto:Moizwani6@gmail.com" className="text-[hsl(var(--primary))] font-bold hover:text-foreground transition-colors underline">Moizwani6@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
