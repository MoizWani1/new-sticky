
import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen px-4 py-32 md:px-6">
            <div className="max-w-4xl mx-auto container">
                <div className="bg-white border-2 border-black/5 p-8 md:p-12 rounded-3xl shadow-sm">
                    <h1 className="text-4xl font-display font-bold mb-6 text-foreground uppercase tracking-wide">Privacy Policy</h1>
                    <p className="mb-8 text-muted-foreground font-medium">Effective Date: {new Date().toLocaleDateString()}</p>

                    <section className="mb-8 border-b-2 border-black/5 pb-8">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Welcome to StickyBits. We value your privacy and are committed to protecting your personal information.
                            This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.
                        </p>
                    </section>

                    <section className="mb-8 border-b-2 border-black/5 pb-8">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">2. Information We Collect</h2>
                        <p className="mb-4 text-muted-foreground leading-relaxed">We may collect the following types of information:</p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                            <li><strong className="text-foreground">Personal Information:</strong> Name, email address, shipping address, billing information, and phone number when you make a purchase or sign up for our newsletter.</li>
                            <li><strong className="text-foreground">Usage Data:</strong> Information about how you use our website, including IP address, browser type, and device information.</li>
                        </ul>
                    </section>

                    <section className="mb-8 border-b-2 border-black/5 pb-8">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">3. How We Use Your Information</h2>
                        <p className="mb-4 text-muted-foreground leading-relaxed">We use your information to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                            <li>Process and fulfill your orders.</li>
                            <li>Communicate with you about your order status.</li>
                            <li>Send promotional emails (if you opted in).</li>
                            <li>Improve our website and customer service.</li>
                        </ul>
                    </section>

                    <section className="mb-8 border-b-2 border-black/5 pb-8">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">4. Data Sharing</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We do not sell your personal information. We may share your data with trusted third-party service providers who assist us in operating our website,
                            conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                        </p>
                    </section>

                    <section className="mb-0">
                        <h2 className="text-2xl font-display font-bold mb-4 text-primary">5. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:Moizwani6@gmail.com" className="text-[hsl(var(--primary))] font-bold hover:text-foreground transition-colors underline">Moizwani6@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
