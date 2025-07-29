export const config = {
    runtime: 'edge',
  }
  
  export default async function handler(req: Request): Promise<Response> {
    const webhookUrl = process.env.GLIDE_WEBHOOK_URL
  
    if (!webhookUrl) {
      return new Response(JSON.stringify({ message: 'No webhook URL set' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  
    // Dummy test payload
    const payload = {
      inspection_id: 'dummy-inspection-id-123',
      media: [
        'https://dummy.com/image1.jpg',
        'https://dummy.com/image2.jpg',
      ],
      status: 'complete',
    }
  
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
  
      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ Webhook failed:', errorText)
        return new Response(JSON.stringify({ message: 'Webhook failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }
  
      return new Response(JSON.stringify({ message: 'Webhook sent successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err: any) {
      console.error('❌ Error sending webhook:', err)
      return new Response(JSON.stringify({ message: 'Unexpected error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }