import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const itemCategory = formData.get('itemCategory') as string
    const description = formData.get('description') as string
    const address = formData.get('address') as string
    const language = formData.get('language') as string
    const photo = formData.get('photo') as File | null

    // Validate required fields
    if (!name || !phone || !email || !itemCategory || !description || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create email transporter (using Gmail SMTP as a fallback)
    // Note: For production, you should use environment variables for credentials
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'noreply@skypersia.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    })

    // Category translations
    const categoryTranslations: { [key: string]: { ja: string, en: string } } = {
      computer: { ja: 'コンピューター・PC', en: 'Computers & PCs' },
      appliance: { ja: '家電製品', en: 'Appliances' },
      metal: { ja: '金属スクラップ', en: 'Scrap Metal' },
      electronics: { ja: '電子機器', en: 'Electronics' },
      furniture: { ja: '家具', en: 'Furniture' },
      bicycle: { ja: '自転車', en: 'Bicycles' },
      other: { ja: 'その他', en: 'Other' }
    }

    const categoryLabel = categoryTranslations[itemCategory]?.[language as 'ja' | 'en'] || itemCategory

    // Prepare email content
    const emailSubject = language === 'ja' 
      ? `【新規回収依頼】${name}様 - ${categoryLabel}`
      : `[New Pickup Request] ${name} - ${categoryLabel}`

    const emailBody = language === 'ja' ? `
新しい回収依頼が届きました

━━━━━━━━━━━━━━━━━━━━
お客様情報
━━━━━━━━━━━━━━━━━━━━

お名前：${name}
電話番号：${phone}
メールアドレス：${email}
住所：${address}

━━━━━━━━━━━━━━━━━━━━
品目情報
━━━━━━━━━━━━━━━━━━━━

品目カテゴリー：${categoryLabel}

詳細説明：
${description}

${photo ? '※ 写真が添付されています' : '※ 写真の添付なし'}

━━━━━━━━━━━━━━━━━━━━

このメールは自動送信されています。
お客様への連絡をお願いいたします。

Sky Persia リサイクル回収システム
    ` : `
New pickup request received

━━━━━━━━━━━━━━━━━━━━
Customer Information
━━━━━━━━━━━━━━━━━━━━

Name: ${name}
Phone: ${phone}
Email: ${email}
Address: ${address}

━━━━━━━━━━━━━━━━━━━━
Item Information
━━━━━━━━━━━━━━━━━━━━

Item Category: ${categoryLabel}

Description:
${description}

${photo ? '※ Photo attached' : '※ No photo attached'}

━━━━━━━━━━━━━━━━━━━━

This is an automated message.
Please contact the customer.

Sky Persia Recycling System
    `

    // Prepare email options
    const mailOptions: any = {
      from: `"Sky Persia Recycling" <noreply@skypersia.com>`,
      to: 'farshad.mehdizadeh20@gmail.com',
      replyTo: email,
      subject: emailSubject,
      text: emailBody,
    }

    // Add photo attachment if present
    if (photo) {
      const buffer = Buffer.from(await photo.arrayBuffer())
      mailOptions.attachments = [{
        filename: photo.name,
        content: buffer
      }]
    }

    // Send email
    // Note: This will fail without proper SMTP credentials
    // For demo purposes, we'll just log the submission
    console.log('Form submission received:', {
      name,
      phone,
      email,
      itemCategory: categoryLabel,
      address,
      hasPhoto: !!photo
    })

    // In a real production environment, you would uncomment this:
    // await transporter.sendMail(mailOptions)

    // For now, we'll simulate success
    // You can set up proper email credentials or use a service like Resend, SendGrid, etc.
    
    return NextResponse.json({ 
      success: true,
      message: 'Submission received successfully' 
    })

  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}
