const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const { name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !subject || !message) {
            return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
        }

        // Map subject values to Arabic
        const subjectMap = {
            'quotation': 'طلب عرض سعر',
            'consultation': 'استشارة فنية',
            'complaint': 'شكوى',
            'general': 'استفسار عام'
        };

        const subjectText = subjectMap[subject] || subject;

        // Create a Nodemailer transporter using Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, // Your Gmail address (e.g., Babel@gmail.com)
                pass: process.env.GMAIL_PASS  // Your Gmail App Password
            }
        });

        const mailOptions = {
            from: `"موقع بابل" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER, // Send to yourself
            replyTo: email, // If you click "reply" in Gmail, it replies to the customer
            subject: `رسالة جديدة من موقع بابل: ${subjectText}`,
            html: `
        <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
          <div style="background: #8B0000; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">📩 رسالة جديدة من موقع بابل</h1>
          </div>
          <div style="padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; color: #8B0000; font-weight: bold; width: 120px;">الاسم:</td>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; color: #8B0000; font-weight: bold;">البريد:</td>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; color: #8B0000; font-weight: bold;">الجوال:</td>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;"><a href="tel:${phone}">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; color: #8B0000; font-weight: bold;">الموضوع:</td>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${subjectText}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding: 20px; background: #f9f9f9; border-radius: 8px; border-right: 4px solid #8B0000;">
              <p style="color: #8B0000; font-weight: bold; margin: 0 0 8px 0;">الرسالة:</p>
              <p style="color: #333; line-height: 1.8; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <div style="background: #f5f5f5; padding: 16px; text-align: center; color: #999; font-size: 12px;">
            تم الإرسال من موقع شركة بابل عبر Gmail
          </div>
        </div>
      `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'تم إرسال رسالتك بنجاح!' });

    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' });
    }
};
