import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are a helpful AI assistant embedded on a website. Your role is to help visitors navigate the site, answer their questions, and provide helpful information.

Guidelines:
- Be friendly, professional, and concise
- If you don't know something specific about the site, be honest about it
- Suggest relevant pages or sections when appropriate
- Keep responses brief but informative
- Use markdown formatting when helpful (lists, bold, etc.)

When users ask about site features, pricing, or specific content, provide helpful general guidance while being clear about what you can and cannot definitively answer.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Return a demo response if no API key is configured
      return NextResponse.json({
        message: getDemoResponse(messages[messages.length - 1]?.content || ''),
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m: ChatMessage) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDemoResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! Welcome to our site. How can I help you today? I can answer questions about our features, guide you to specific pages, or help you find what you're looking for.";
  }

  if (lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
    return "For pricing information, I'd recommend checking out our Pricing page. We offer several plans to fit different needs:\n\n- **Free Tier**: Great for getting started\n- **Pro Plan**: Best for growing businesses\n- **Enterprise**: Custom solutions for large teams\n\nWould you like me to tell you more about any specific plan?";
  }

  if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
    return "You can reach our support team through several channels:\n\n- **Email**: support@example.com\n- **Live Chat**: Available 9am-5pm EST\n- **Help Center**: Check our FAQ for quick answers\n\nIs there something specific I can help you with right now?";
  }

  if (lowerMessage.includes('feature') || lowerMessage.includes('what can') || lowerMessage.includes('how does')) {
    return "Our platform offers several key features:\n\n1. **AI-Powered Assistance**: Smart responses to your questions\n2. **Easy Integration**: Embed on any website in minutes\n3. **Customization**: Match your brand colors and style\n4. **Analytics**: Track conversations and improve over time\n\nWhich feature would you like to learn more about?";
  }

  if (lowerMessage.includes('demo') || lowerMessage.includes('try') || lowerMessage.includes('test')) {
    return "You're using our demo right now! This chatbot showcases what's possible with our platform. In a production environment, I'd be connected to an AI service and could provide even more helpful responses tailored to your specific site content.\n\nWant to see how it would work on your website?";
  }

  return "Thanks for your question! I'm here to help you navigate our site and find information. You can ask me about:\n\n- **Features** and capabilities\n- **Pricing** and plans\n- **Getting started** with our platform\n- **Support** and contact options\n\nWhat would you like to know more about?";
}
