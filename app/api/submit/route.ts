import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Validate required fields
    if (!name || !phone || !email || !itemCategory || !description || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Collect photos
    const photos: File[] = []
    let photoIndex = 0
    while (formData.has(`photo${photoIndex}`)) {
      const photo = formData.get(`photo${photoIndex}`) as File
      if (photo && photo.size > 0) {
        photos.push(photo)
      }
      photoIndex++
    }

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

    // Prepare email subject
    const emailSubject = language === 'ja' 
      ? `【新規回収依頼】${name}様 - ${categoryLabel}`
      : `[New Pickup Request] ${name} - ${categoryLabel}`

    // Prepare email HTML content
    const emailHtml = language === 'ja' ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; border: 1px solid #e5e7eb; }
    .section { background: white; padding: 15px; margin-bottom: 15px; border-radius: 6px; border-left: 4px solid #0ea5e9; }
    .label { font-weight: bold; color: #0ea5e9; margin-bottom: 5px; }
    .value { color: #374151; }
    .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🔔 新規回収依頼</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Sky Persia リサイクル回収システム</p>
    </div>
    <div class="content">
      <div class="section">
        <h3 style="margin-top: 0; color: #0ea5e9;">👤 お客様情報</h3>
        <div class="label">お名前</div>
        <div class="value">${name}</div>
        <div class="label" style="margin-top: 10px;">電話番号</div>
        <div class="value">${phone}</div>
        <div class="label" style="margin-top: 10px;">メールアドレス</div>
        <div class="value">${email}</div>
        <div class="label" style="margin-top: 10px;">住所</div>
        <div class="value">${address}</div>
      </div>
      
      <div class="section">
        <h3 style="margin-top: 0; color: #0ea5e9;">📦 品目情報</h3>
        <div class="label">品目カテゴリー</div>
        <div class="value">${categoryLabel}</div>
        <div class="label" style="margin-top: 10px;">詳細説明</div>
        <div class="value" style="white-space: pre-wrap;">${description}</div>
        <div style="margin-top: 10px; padding: 10px; background: #fef3c7; border-radius: 4px; color: #92400e;">
          ${photos.length > 0 ? `📷 写真 ${photos.length} 枚が添付されています` : '📷 写真の添付なし'}
        </div>
      </div>
      
      <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 15px;">
        <strong>⏰ 次のステップ:</strong><br>
        営業時間内にお客様へご連絡をお願いいたします。
      </div>
    </div>
    <div class="footer">
      このメールは自動送信されています<br>
      Sky Persia - 埼玉県比企郡川島町下八ツ林731-1<br>
      📞 049-297-1355 / 070-9151-1212
    </div>
  </div>
</body>
</html>
    ` : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; border: 1px solid #e5e7eb; }
    .section { background: white; padding: 15px; margin-bottom: 15px; border-radius: 6px; border-left: 4px solid #0ea5e9; }
    .label { font-weight: bold; color: #0ea5e9; margin-bottom: 5px; }
    .value { color: #374151; }
    .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🔔 New Pickup Request</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Sky Persia Recycling System</p>
    </div>
    <div class="content">
      <div class="section">
        <h3 style="margin-top: 0; color: #0ea5e9;">👤 Customer Information</h3>
        <div class="label">Name</div>
        <div class="value">${name}</div>
        <div class="label" style="margin-top: 10px;">Phone</div>
        <div class="value">${phone}</div>
        <div class="label" style="margin-top: 10px;">Email</div>
        <div class="value">${email}</div>
        <div class="label" style="margin-top: 10px;">Address</div>
        <div class="value">${address}</div>
      </div>
      
      <div class="section">
        <h3 style="margin-top: 0; color: #0ea5e9;">📦 Item Information</h3>
        <div class="label">Category</div>
        <div class="value">${categoryLabel}</div>
        <div class="label" style="margin-top: 10px;">Description</div>
        <div class="value" style="white-space: pre-wrap;">${description}</div>
        <div style="margin-top: 10px; padding: 10px; background: #fef3c7; border-radius: 4px; color: #92400e;">
          ${photos.length > 0 ? `📷 ${photos.length} photo(s) attached` : '📷 No photos attached'}
        </div>
      </div>
      
      <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 15px;">
        <strong>⏰ Next Steps:</strong><br>
        Please contact the customer during business hours.
      </div>
    </div>
    <div class="footer">
      This is an automated message<br>
      Sky Persia - 731-1 Shimoyatsubayashi, Kawajima, Hiki District, Saitama 350-0122<br>
      📞 049-297-1355 / 070-9151-1212
    </div>
  </div>
</body>
</html>
    `

    // Convert photos to attachments for Resend
    const attachments = await Promise.all(
      photos.map(async (photo, index) => {
        const buffer = Buffer.from(await photo.arrayBuffer())
        return {
          filename: photo.name,
          content: buffer
        }
      })
    )

    // Send email using Resend
    try {
      const { data, error } = await resend.emails.send({
        from: 'Sky Persia Recycling <noreply@skypersia-recycling.apps.grok.bot>',
        to: 'farshad.mehdizadeh20@gmail.com',
        replyTo: email,
        subject: emailSubject,
        html: emailHtml,
        attachments: attachments.length > 0 ? attachments : undefined
      })

      if (error) {
        console.error('Resend error:', error)
        return NextResponse.json(
          { error: 'Failed to send email', details: error },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true,
        message: 'Submission received and email sent successfully',
        emailId: data?.id
      })

    } catch (emailError) {
      console.error('Email sending error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email', details: String(emailError) },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission', details: String(error) },
      { status: 500 }
    )
  }
}
