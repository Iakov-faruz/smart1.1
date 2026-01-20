// טעינת משתני הסביבה
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = (userEmail, username) => {
    const mailOptions = {
        from: `"Smart Shop" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'ברוך הבא ל-Smart Shop! 🎉',
        html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; border: 1px solid #3498db; padding: 20px; border-radius: 10px;">
                <h2 style="color: #2c3e50;">שלום ${username},</h2>
                <p>איזה כיף שהצטרפת למשפחת <strong>Smart Shop</strong>!</p>
                <p>החשבון שלך נוצר בהצלחה ומוכן לשימוש.</p>
                <hr style="border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 0.9rem; color: #7f8c8d;">נתראה בחנות,<br>צוות Smart Shop</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

const sendOrderReceipt = (userEmail, orderDetails) => {
    const { orderId, items, totalAmount, customerName } = orderDetails;

    const itemsHtml = items.map(item => `
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">₪${item.price}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"Smart Shop" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `אישור הזמנה # ${orderId} - תודה שקנית אצלנו!`,
        html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #2c3e50;">תודה רבה, ${customerName}!</h2>
                <p>ההזמנה שלך התקבלה בהצלחה במערכת.</p>
                <h3>פרטי הזמנה מספר: ${orderId}</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ddd; padding: 8px;">מוצר</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">כמות</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">מחיר</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <p style="font-size: 1.2rem;"><strong>סה"כ לתשלום: ₪${totalAmount}</strong></p>
                <hr />
                <p>נשמח לראות אותך שוב בקרוב!</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

// עדכון הייצוא שיכלול את שתי הפונקציות
module.exports = { sendWelcomeEmail, sendOrderReceipt };