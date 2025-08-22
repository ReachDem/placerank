import { sendSMS } from "@/lib/sms";
//sens sms to a single number 

export async function POST(request: Request) {
    const { sender, message, phone } = await request.json();
    try {
        const response = await sendSMS(sender, message, phone);
        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to send SMS" + error }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}
