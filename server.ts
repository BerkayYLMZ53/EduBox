import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Email Configuration
  // Note: These should be provided by the user in the .env file
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // API Routes
  app.post("/api/notifications/reward-claim", async (req, res) => {
    const { userEmail, userName, rewardTitle, successScore } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL || "admin@edubox.com";

    const mailOptions = {
        from: '"EduBox System" <noreply@edubox.com>',
        to: adminEmail,
        subject: "Yeni Fiziksel Ödül Talebi!",
        text: `Yeni bir ödül talebi geldi!\n\nKullanıcı: ${userName} (${userEmail})\nÖdül: ${rewardTitle}\nBaşarı Skoru: ${successScore}\n\nLütfen en kısa sürede kontrol edin.`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6366f1;">Yeni Fiziksel Ödül Talebi!</h2>
                <p>Yeni bir ödül talebi geldi!</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <p><strong>Kullanıcı:</strong> ${userName} (${userEmail})</p>
                    <p><strong>Ödül:</strong> ${rewardTitle}</p>
                    <p><strong>Başarı Skoru:</strong> ${successScore}</p>
                </div>
                <p>Lütfen en kısa sürede kontrol edin.</p>
            </div>
        `,
    };

    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials missing. Email not sent.");
        return res.status(200).json({ 
            success: true, 
            message: "Demo Mode: SMTP credentials missing, but request received.",
            demo: true 
        });
      }

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Email sending failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
