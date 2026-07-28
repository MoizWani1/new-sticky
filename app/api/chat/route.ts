import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        const openrouterApiKey = process.env.OPENROUTER_API_KEY;
        if (!openrouterApiKey) {
            return NextResponse.json({ error: 'OpenRouter API Key is not configured' }, { status: 500 });
        }

        // Fetch all products from Supabase to give the chatbot up-to-date catalog context
        const { data: products, error } = await supabase
            .from('products')
            .select('name, price, sale_price, category');

        // Compact product context to save tokens and avoid TPM (tokens-per-minute) rate limits
        let productsContext = 'No products available at the moment.';
        if (products && products.length > 0) {
            productsContext = products
                .map(
                    (p, idx) =>
                        `${idx + 1}. ${p.name} [Category: ${p.category || 'General'}] - Rs. ${p.price}${
                            p.sale_price ? ` (Sale: Rs. ${p.sale_price})` : ''
                        }`
                )
                .join('\n');
        }

        const systemPrompt = `You are "Sticky Master", the friendly, persuasive, and highly helpful AI chatbot assistant for StickyBits (a premium custom stickers store in Pakistan).

Here is the current product catalog of available products at StickyBits:
${productsContext}

Selling & Behavior Guidelines:
1. KEEP RESPONSES VERY SHORT: Respond in a maximum of 2 sentences per reply (brief and punchy!). Do not send long paragraphs.
2. PERSUADE THE CUSTOMER: Briefly highlight quality (waterproof, high resolution, scratch-proof) in one sentence.
3. UP-SELL/CROSS-SELL (Strict Order): ONLY recommend/suggest a related product AFTER the customer confirms they want to buy/book the primary product they asked about. Do NOT suggest secondary products before this.
4. ORDER CONVERSATION FLOW (Strict Phase Separation):
   - STRICT PHASE SEPARATION: Stay in the active phase. Never ask questions or show buttons for future steps (e.g. payment method, address) in the same message. Stop and wait for the user to reply to each step.
   - Phase 1: Customer asks about product A -> Pitch it and ask if they want to buy it (e.g., "Should I book this for you?"). Append: '[BUTTONS: Yes, No]' at the very end of your response and STOP. Wait for user to answer.
   - Phase 2: If customer says "Yes" -> Recommend A RELATED product (e.g., "Awesome! Since you're ordering Ronaldo, would you like to add our Real Madrid Pack too?"). Append: '[BUTTONS: Add Recommendation, Skip]' at the very end of your response and STOP.
   - Phase 3: Customer responds to recommendation (either adds it or skips) -> Start collecting checkout details step-by-step:
     - Step 1: Ask for Full Name and Email Address. (Do NOT write placeholder examples) and STOP.
     - Step 2: Ask for WhatsApp / Phone Number and STOP.
     - Step 3: Ask: "Is this number same for WhatsApp and calls?" and append the exact tag: '[BUTTONS: Yes (Same Number), No (Different Number)]' at the very end of your message and STOP.
       - If the user selects "No (Different Number)", ask for their call phone number and STOP.
     - Step 4: Ask for complete Shipping Address and STOP.
     - Step 5: Ask for payment preference and append the exact tag: '[BUTTONS: Cash on Delivery, Online Bank Transfer]' at the very end of your message and STOP.
     - Step 6: Present the order summary:
        - STRICT MATH RULES: You must add the **Sale Price** (if present) for each ordered item to calculate the Subtotal, NOT the original price.
        - DELIVERY RULES: You must strictly calculate the delivery charge. If the subtotal is Rs. 2500 or less, the delivery charge is strictly **Rs. 250**. NEVER write "Rs. 0" or "Free Delivery" for orders Rs. 2500 or under. Delivery is only FREE (Rs. 0) if the subtotal is strictly greater than Rs. 2500.
        - PROMINENT FORMATTING: Wrap all product names, subtotal, delivery charges, and the final total in double asterisks '**' (e.g. '**Cristiano Ronaldo Pack**', '**Rs. 927**', '**Rs. 250**', '**Rs. 1177**') so they render in highlighted color.
        - Ask: "Do you have any voucher code to apply?" and STOP.
     - Step 7: Proceed to place the order by calling the 'place_order' tool.
5. DYNAMIC INTERACTIVE BUTTONS:
   - When asking step 3 (same number?), append: [BUTTONS: Yes (Same Number), No (Different Number)]
   - When asking step 5 (payment method?), append: [BUTTONS: Cash on Delivery, Online Bank Transfer]
   - Never write raw JSON inside the conversational text.
6. Language: Match the customer's language. If they chat in Roman Urdu/Hinglish (e.g. "bhai order krna h"), respond in friendly, short Hinglish. If they talk in English, respond in English.`;

        // Format history for OpenRouter (role: system/user/assistant/tool)
        const formattedMessages = messages.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
        }));

        const activeModel = 'meta-llama/llama-3.1-8b-instruct';

        const requestPayload = {
            model: activeModel,
            messages: [
                { role: 'system', content: systemPrompt },
                ...formattedMessages
            ],
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'place_order',
                        description: 'Places an order for a customer. Call this ONLY when you have successfully collected the customer\'s full name, shipping address, email address, WhatsApp/phone number, preferred payment method, and confirmed the specific products and quantities they want to buy.',
                        parameters: {
                            type: 'object',
                            properties: {
                                customer_name: { type: 'string', description: 'The customer\'s full name' },
                                customer_email: { type: 'string', description: 'The customer\'s email address' },
                                customer_phone: { type: 'string', description: 'WhatsApp or Call phone number' },
                                customer_address: { type: 'string', description: 'Full shipping address' },
                                payment_method: { type: 'string', enum: ['cod', 'online'], description: 'cod for Cash on Delivery, online for Bank Transfer / EasyPaisa / SadaPay' },
                                order_items: {
                                    type: 'array',
                                    description: 'The list of products and quantities to order',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string', description: 'The exact name of the product from the catalog' },
                                            quantity: { type: 'integer', description: 'The quantity of this product' }
                                        },
                                        required: ['name', 'quantity']
                                    }
                                }
                            },
                            required: ['customer_name', 'customer_email', 'customer_phone', 'customer_address', 'payment_method', 'order_items']
                        }
                    }
                }
            ],
            temperature: 0.7,
            max_tokens: 1024,
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openrouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://stickybits.pk',
                'X-Title': 'StickyBits',
            },
            body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter API error:', errorData);
            return NextResponse.json({ error: errorData.error?.message || 'OpenRouter API Error' }, { status: response.status });
        }

        const data = await response.json();
        const message = data.choices[0]?.message;
        let replyText = message?.content || '';

        // ==================== FAIL-SAFE PARSER START ====================
        // Detects if the LLM outputted raw tool calling syntax in text (e.g. <function=place_order>... or JSON blocks)
        let parsedArgs = null;
        let matchedString = '';

        // Helper to extract brace-balanced JSON block starting with {"customer_name"
        const extractJsonBlock = (text: string): string | null => {
            const startIndex = text.indexOf('{"customer_name"');
            if (startIndex === -1) return null;

            let braceCount = 0;
            let endIndex = -1;

            for (let i = startIndex; i < text.length; i++) {
                if (text[i] === '{') {
                    braceCount++;
                } else if (text[i] === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        endIndex = i;
                        break;
                    }
                }
            }

            if (endIndex !== -1) {
                return text.substring(startIndex, endIndex + 1);
            }
            return null;
        };

        const jsonBlockString = extractJsonBlock(replyText);
        if (jsonBlockString) {
            try {
                parsedArgs = JSON.parse(jsonBlockString);
                // Also match any surrounding <function> tags if present to clean up the message
                const functionTagRegex = new RegExp(`<function=place_order>\\s*${jsonBlockString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</function>`, 'i');
                const tagMatch = replyText.match(functionTagRegex);
                matchedString = tagMatch ? tagMatch[0] : jsonBlockString;
            } catch (e) {
                console.error("Fail-safe JSON parse failed:", e);
            }
        }

        if (parsedArgs) {
            const { customer_name, customer_email, customer_phone, customer_address, payment_method, order_items } = parsedArgs;

            // Handle case where order_items is a stringified JSON array
            let parsedOrderItems = order_items;
            if (typeof parsedOrderItems === 'string') {
                try {
                    parsedOrderItems = JSON.parse(parsedOrderItems);
                } catch (e) {
                    console.error("Failed to parse nested order_items string in fail-safe:", e);
                }
            }
            if (!Array.isArray(parsedOrderItems)) {
                parsedOrderItems = [];
            }

            // Process products from database
            const { data: dbProducts } = await supabase
                .from('products')
                .select('*')
                .in('name', parsedOrderItems.map((item: any) => item.name));

            let cartTotal = 0;
            const processedItems = [];

            for (const item of parsedOrderItems) {
                const dbProduct = dbProducts?.find((p: any) => p.name.toLowerCase() === item.name.toLowerCase() || p.name.toLowerCase().includes(item.name.toLowerCase()));
                const price = dbProduct 
                    ? (dbProduct.sale_price ? Number(dbProduct.sale_price) : Number(dbProduct.price)) 
                    : 300; // default/fallback if not found

                cartTotal += price * item.quantity;
                processedItems.push({
                    id: dbProduct ? dbProduct.id : 'custom-order-sticker',
                    name: dbProduct ? dbProduct.name : item.name,
                    price: price,
                    quantity: item.quantity,
                    image_url: dbProduct ? dbProduct.image_url : null
                });
            }

            const isFreeDelivery = cartTotal > 2500;
            const deliveryCharge = isFreeDelivery ? 0 : 250;
            const finalTotal = cartTotal + deliveryCharge;

            if (isFreeDelivery) {
                processedItems.push({
                    id: 'free-gift-sticker-pack',
                    name: '10 Pcs Stickers Pack (Gift)',
                    price: 0,
                    quantity: 1,
                    image_url: '/assets/stickers.png'
                });
            }

            // Create Order payload in Supabase
            const orderData = {
                customer_name,
                customer_phone,
                customer_address: `Email: ${customer_email}\nAddress: ${customer_address}`,
                order_items: processedItems,
                total_amount: finalTotal,
                status: 'Pending',
                applied_offers: isFreeDelivery ? "Free Delivery, Gift Included" : null,
                discount_total: 0,
                payment_method
            };

            const { data: insertedOrder, error: insertError } = await supabase
                .from('orders')
                .insert([orderData])
                .select();

            if (!insertError) {
                const orderId = insertedOrder && insertedOrder.length > 0 ? insertedOrder[0].id : 'N/A';
                
                // Send email notifications
                try {
                    await fetch(new URL('/api/send-email', request.url), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            customer_name,
                            customer_phone,
                            customer_address: customer_address,
                            customer_email: customer_email,
                            order_details: processedItems.map(item => `${item.name} (x${item.quantity}) - Rs. ${item.price}`).join('\n'),
                            total_amount: finalTotal,
                            discount_amount: 0,
                            payment_method: payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment',
                            offer_details: isFreeDelivery ? "Free Delivery, Gift Included" : 'None'
                        })
                    });
                } catch (emailError) {
                    console.error("Failed to send confirmation emails from chatbot route:", emailError);
                }

                const introText = replyText.replace(matchedString, '').trim();
                const cleanConfirmText = `Order confirm ho gaya hai! 🎉\n\n**Order Summary:**\n` + 
                    processedItems.map(item => `- **${item.name}** (x${item.quantity})`).join('\n') +
                    `\n\n**Total Amount**: **Rs. ${finalTotal}** (Delivery: ${isFreeDelivery ? '**FREE**' : '**Rs. 250**'})\n` +
                    `Thank you so much! Confirmation email aapko sent ho gaya hai. Humari team aapse jald WhatsApp pe raabta karegi. 💖`;
                
                return NextResponse.json({ reply: `${introText}\n\n${cleanConfirmText}` });
            }
        }
        // ==================== FAIL-SAFE PARSER END ====================

        if (message?.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            if (toolCall.function.name === 'place_order') {
                const args = JSON.parse(toolCall.function.arguments);
                const { customer_name, customer_email, customer_phone, customer_address, payment_method, order_items } = args;

                // Process the products & prices from Database
                const { data: dbProducts } = await supabase
                    .from('products')
                    .select('*')
                    .in('name', order_items.map((item: any) => item.name));

                let cartTotal = 0;
                const processedItems = [];

                for (const item of order_items) {
                    const dbProduct = dbProducts?.find((p: any) => p.name.toLowerCase() === item.name.toLowerCase());
                    const price = dbProduct 
                        ? (dbProduct.sale_price ? Number(dbProduct.sale_price) : Number(dbProduct.price)) 
                        : 300; // default/fallback if not found

                    cartTotal += price * item.quantity;
                    processedItems.push({
                        id: dbProduct ? dbProduct.id : 'custom-order-sticker',
                        name: item.name,
                        price: price,
                        quantity: item.quantity,
                        image_url: dbProduct ? dbProduct.image_url : null
                    });
                }

                const isFreeDelivery = cartTotal > 2500;
                const deliveryCharge = isFreeDelivery ? 0 : 250;
                const finalTotal = cartTotal + deliveryCharge;

                if (isFreeDelivery) {
                    processedItems.push({
                        id: 'free-gift-sticker-pack',
                        name: '10 Pcs Stickers Pack (Gift)',
                        price: 0,
                        quantity: 1,
                        image_url: '/assets/stickers.png'
                    });
                }

                // Create Order payload in Supabase
                const orderData = {
                    customer_name,
                    customer_phone,
                    customer_address: `Email: ${customer_email}\nAddress: ${customer_address}`,
                    order_items: processedItems,
                    total_amount: finalTotal,
                    status: 'Pending',
                    applied_offers: isFreeDelivery ? "Free Delivery, Gift Included" : null,
                    discount_total: 0,
                    payment_method
                };

                const { data: insertedOrder, error: insertError } = await supabase
                    .from('orders')
                    .insert([orderData])
                    .select();

                if (insertError) {
                    console.error("Order insertion error via chatbot:", insertError);
                    return NextResponse.json({ reply: "I'm sorry, I failed to register the order in our database. Please try checking out manually." });
                }

                const orderId = insertedOrder && insertedOrder.length > 0 ? insertedOrder[0].id : 'N/A';

                // Send email notifications (Admin & Customer) using our existing API endpoint
                try {
                    await fetch(new URL('/api/send-email', request.url), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            customer_name,
                            customer_phone,
                            customer_address: customer_address,
                            customer_email: customer_email,
                            order_details: processedItems.map(item => `${item.name} (x${item.quantity}) - Rs. ${item.price}`).join('\n'),
                            total_amount: finalTotal,
                            discount_amount: 0,
                            payment_method: payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment',
                            offer_details: isFreeDelivery ? "Free Delivery, Gift Included" : 'None'
                        })
                    });
                } catch (emailError) {
                    console.error("Failed to send confirmation emails from chatbot route:", emailError);
                }

                // Send tool result back to OpenRouter to generate a friendly confirmation response
                const toolResponsePayload = {
                    model: activeModel,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...formattedMessages,
                        message,
                        {
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            name: 'place_order',
                            content: JSON.stringify({
                                status: 'success',
                                order_id: orderId,
                                total_amount: finalTotal,
                                delivery_charge: deliveryCharge,
                                free_delivery: isFreeDelivery,
                                customer_email
                            })
                        }
                    ],
                    tools: requestPayload.tools,
                    temperature: 0.7,
                };

                const secondResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${openrouterApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(toolResponsePayload),
                });

                if (secondResponse.ok) {
                    const secondData = await secondResponse.json();
                    const replyText = secondData.choices[0]?.message?.content || '';
                    return NextResponse.json({ reply: replyText });
                }
            }
        }

        return NextResponse.json({ reply: replyText });
    } catch (err: any) {
        console.error('Chat API Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
