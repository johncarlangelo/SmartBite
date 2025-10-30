import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { email, message } = await request.json()

        // Validate input
        if (!email || !message) {
            return NextResponse.json(
                { error: 'Email and message are required' },
                { status: 400 }
            )
        }

        // Using Web3Forms - Free email service
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: '15684f42-24db-4abd-9569-94108eb85e98',
                subject: 'New Contact from SmartBite',
                from_name: 'SmartBite Contact Form',
                email: email,
                message: `From: ${email}\n\nMessage:\n${message}`
            })
        })

        const result = await response.json()

        if (result.success) {
            return NextResponse.json({ 
                success: true,
                message: 'Email sent successfully!'
            })
        } else {
            console.error('Web3Forms error:', result)
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Error sending contact email:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
