
import React from 'react';

export default function OwnershipStatement() {
    return (
        <div className="min-h-screen px-4 py-32 md:px-6">
            <div className="max-w-4xl mx-auto container">
                <div className="bg-white border-2 border-black/5 p-8 md:p-12 rounded-3xl shadow-sm text-center">
                    <h1 className="text-4xl font-display font-bold mb-8 text-foreground uppercase tracking-wide">Ownership Statement</h1>

                    <div className="bg-primary/5 p-8 rounded-2xl border-2 border-primary/20 max-w-2xl mx-auto">
                        <p className="text-xl mb-6 text-foreground leading-relaxed">
                            This website (<strong className="text-[hsl(var(--primary))] font-display">StickyBits</strong>) is owned and operated by <strong className="font-display">Moeez Nabi Wani</strong>.
                        </p>

                        <p className="mb-8 text-muted-foreground leading-relaxed">
                            All content, products, and services provided on this platform are the intellectual property of the owner, unless otherwise stated.
                        </p>

                        <div className="border-t-2 border-primary/20 pt-6">
                            <h3 className="text-2xl font-display font-bold mb-4 text-foreground">Contact Information</h3>
                            <p className="text-muted-foreground mb-2">
                                For any legal inquiries or questions regarding ownership, please contact:
                            </p>
                            <p className="mt-2 text-lg">
                                <strong className="text-foreground">Email:</strong> <a href="mailto:Moizwani6@gmail.com" className="text-[hsl(var(--primary))] font-bold hover:text-foreground transition-colors underline">Moizwani6@gmail.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
