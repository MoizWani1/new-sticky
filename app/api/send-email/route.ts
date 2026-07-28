import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customer_name,
            customer_phone,
            customer_address,
            customer_email,
            order_details,
            total_amount,
            discount_amount,
            payment_method,
            offer_details,
        } = body;

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'orders@stickybits.store';
        const adminEmail = process.env.RESEND_TO_EMAIL || 'moizwani6@gmail.com';

        // 1. Send Notification Email to Admin
        const adminEmailResponse = await resend.emails.send({
            from: `StickyBits Orders <${fromEmail}>`,
            to: [adminEmail],
            subject: `🚨 New Order Received - ${customer_name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #FF007F; border-bottom: 2px solid #FF007F; padding-bottom: 10px; margin-top: 0;">New Order Placed!</h2>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #333; margin-bottom: 5px;">Customer Details</h3>
                        <p style="margin: 5px 0;"><strong>Name:</strong> ${customer_name}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${customer_email}</p>
                        <p style="margin: 5px 0;"><strong>Phone:</strong> ${customer_phone}</p>
                        <p style="margin: 5px 0;"><strong>Address:</strong> ${customer_address}</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #333; margin-bottom: 5px;">Order Information</h3>
                        <pre style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap; font-family: monospace; font-size: 14px; margin: 0;">${order_details}</pre>
                    </div>

                    <div style="margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
                        <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${payment_method}</p>
                        <p style="margin: 5px 0;"><strong>Discount Applied:</strong> Rs. ${discount_amount}</p>
                        <p style="margin: 5px 0;"><strong>Offers Applied:</strong> ${offer_details}</p>
                        <p style="font-size: 18px; margin: 10px 0 0 0;"><strong>Total Amount:</strong> <span style="color: #FF007F; font-weight: bold;">Rs. ${total_amount}</span></p>
                    </div>
                    
                    <p style="color: #888; font-size: 11px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">This is an automated notification from StickyBits. Please do not reply directly to this email.</p>
                </div>
            `,
        });

        // 2. Send Confirmation Email to Customer
        let customerEmailResponse = null;
        if (customer_email) {
            customerEmailResponse = await resend.emails.send({
                from: `StickyBits <${fromEmail}>`,
                to: [customer_email],
                subject: `Order Received! StickyBits 💖`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; color: #333;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h1 style="color: #FF007F; margin: 0 0 10px 0;">StickyBits</h1>
                            <p style="font-size: 16px; font-weight: bold; color: #555; margin: 0;">Thank you for your order, ${customer_name}!</p>
                        </div>
                        
                        <p style="font-size: 14px; line-height: 1.6;">We have successfully received your order. Our management team will process it and contact you on WhatsApp/Phone shortly to verify the details before shipping.</p>
                        
                        <div style="margin-bottom: 20px; background-color: #fff9fb; border: 1px solid #ffd1e3; padding: 15px; border-radius: 8px;">
                            <h3 style="color: #FF007F; margin: 0 0 10px 0;">Order Summary</h3>
                            <pre style="background: transparent; border: none; padding: 0; white-space: pre-wrap; font-family: monospace; font-size: 14px; margin: 0; color: #555;">${order_details}</pre>
                            
                            <hr style="border: 0; border-top: 1px solid #ffd1e3; margin: 15px 0;" />
                            
                            <p style="margin: 5px 0; font-size: 14px;"><strong>Payment Method:</strong> ${payment_method}</p>
                            <p style="margin: 5px 0; font-size: 14px;"><strong>Discount:</strong> Rs. ${discount_amount}</p>
                            <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">Total Amount: <span style="color: #FF007F;">Rs. ${total_amount}</span></p>
                        </div>

                        <div style="margin-bottom: 20px; font-size: 14px;">
                            <h3 style="color: #555; margin: 0 0 5px 0;">Delivery Address</h3>
                            <p style="margin: 0; color: #666; font-style: italic;">${customer_address}</p>
                        </div>

                        <p style="font-size: 14px; line-height: 1.6; color: #555;">If you have any questions or made an online payment, please reply to this email or send a screenshot of the payment to our official WhatsApp support number <strong>(03193672223)</strong>.</p>
                        
                        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            <p style="font-size: 12px; color: #999; margin: 0 0 5px 0;">StickyBits - Premium Custom Stickers Store</p>
                            <p style="font-size: 10px; color: #aaa; margin: 0;">This is an automated message. Please do not reply directly to this email.</p>
                        </div>
                    </div>
                `,
            });
        }

        if (adminEmailResponse.error) {
            console.error('Resend Admin Email Error:', adminEmailResponse.error);
            return NextResponse.json({ error: adminEmailResponse.error.message }, { status: 400 });
        }

        return NextResponse.json({ 
            success: true, 
            adminEmail: adminEmailResponse.data,
            customerEmail: customerEmailResponse ? customerEmailResponse.data : null
        });
    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
