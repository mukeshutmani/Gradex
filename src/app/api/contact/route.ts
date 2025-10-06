import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message, to } = body

    // Check if email credentials are configured
    const hasEmailConfig = process.env.EMAIL_USER &&
                          process.env.EMAIL_PASSWORD &&
                          process.env.EMAIL_PASSWORD !== 'your_gmail_app_password_here'

    if (hasEmailConfig) {
      try {
        // Create a transporter using Gmail SMTP
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        })

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">
              New Contact Form Submission - Gradex
            </h2>

            <div style="margin: 20px 0;">
              <p><strong>From:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Message:</strong></p>
              <p style="margin-top: 10px; white-space: pre-wrap;">${message}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

            <p style="color: #666; font-size: 12px;">
              This email was sent from the Gradex contact form.<br>
              Reply to: ${email}
            </p>
          </div>
        `

        // Send email
        await transporter.sendMail({
          from: `"Gradex Contact Form" <${process.env.EMAIL_USER}>`,
          to: to,
          replyTo: email,
          subject: `Contact Form: ${subject}`,
          html: htmlContent,
          text: `New Contact Form Submission\n\nFrom: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`
        })

        console.log('✅ Email sent successfully to:', to)
      } catch (emailError) {
        console.error('❌ Email sending failed, logging instead:', emailError)
        // Fall through to logging
      }
    }

    // Log the message (works whether email sent or not)
    console.log('\n📧 ============ NEW CONTACT FORM MESSAGE ============')
    console.log('To:', to)
    console.log('From:', name, '<' + email + '>')
    console.log('Subject:', subject)
    console.log('Message:')
    console.log(message)
    console.log('===================================================\n')

    return NextResponse.json({
      success: true,
      message: 'Message received successfully! We will get back to you soon.'
    })
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    )
  }
}
