'use client'
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

const Footer = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState("");

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setStatus('error');
            setMessage('Please enter a valid email address.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email }]);

            if (error) {
                if (error.code === '23505') { // Unique violation
                    setStatus('error');
                    setMessage('You are already subscribed!');
                } else {
                    setStatus('error');
                    setMessage('Failed to subscribe. Try again later.');
                }
                return;
            }

            // Success
            setStatus('success');
            setMessage('Thanks for subscribing!');
            setEmail('');

            // Trigger confetti
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#F1D97C', '#000000', '#FFFFFF', '#bf9c2e']
            });

            // Reset success message after 3 seconds
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 3000);

        } catch (err) {
            setStatus('error');
            setMessage('An unexpected error occurred.');
        }
    };

    return (
        <footer className="bg-card border-t border-border mt-16">
            <div className="container mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-display text-2xl font-extrabold mb-2">
                        <span className="text-sticker-green">Sticky</span>
                        <span className="text-primary">Bits</span>
                    </h3>
                    <p className="text-muted-foreground font-body">Peel Good, Stick Better.</p>
                </div>

                <div>
                    <h4 className="font-display text-lg font-bold mb-3">Links</h4>
                    <ul className="space-y-2 font-body text-muted-foreground">
                        <li>
                            <a href="/faqs" className="hover:text-foreground transition-colors">FAQs</a>
                        </li>
                        <li>
                            <a href="/our-vision" className="hover:text-foreground transition-colors">Our Vision</a>
                        </li>
                        <li>
                            <a href="mailto:Moizwani6@gmail.com" className="hover:text-foreground transition-colors">Contact Us</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-display text-lg font-bold mb-3">Legal</h4>
                    <ul className="space-y-2 font-body text-muted-foreground">
                        <li>
                            <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
                        </li>
                        <li>
                            <a href="/refund-policy" className="hover:text-foreground transition-colors">Cancellation & Refund Policy</a>
                        </li>
                        <li>
                            <a href="/terms-conditions" className="hover:text-foreground transition-colors">Terms & Conditions</a>
                        </li>
                        <li>
                            <a href="/ownership-statement" className="hover:text-foreground transition-colors">Ownership Statement</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-display text-lg font-bold mb-3">Sign up by newsletter</h4>
                    <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your address"
                                disabled={status === 'loading'}
                                className="flex-1 px-4 py-2 rounded-full border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="bg-primary text-primary-foreground font-display font-bold px-5 py-2 rounded-full hover:scale-105 transition-transform text-sm disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {status === 'loading' ? 'Sending...' : (status === 'success' ? 'Thanks!' : 'Get Sticker-Bombed')}
                            </button>
                        </div>
                        {message && (
                            <p className={`text-xs px-2 ${status === 'error' ? 'text-red-400' : 'text-sticker-green'}`}>
                                {message}
                            </p>
                        )}
                    </form>
                </div>
            </div>
            <div className="text-center py-4 text-muted-foreground text-sm font-body border-t border-border mt-8">
                <Link href="/admin/dashboard" className="hover:text-foreground transition-colors cursor-pointer mr-1">
                    ©
                </Link>
                <span>2026 StickyBits. All rights reserved.</span>
            </div>
        </footer>
    );
};

export default Footer;
