import express, { Request, Response, RequestHandler } from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./db/index"; // Import database connection

dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Allow frontend requests

// ✅ Health Check Route
app.get("/", ((req: Request, res: Response) => {
  res.send("⚡ BTIFLIX Backend is Running!");
}) as RequestHandler);

// ✅ Payment Route (Mock BTCPay API)
app.post("/api/payments/create", ((req: Request, res: Response) => {
  try {
    const { movieId, amount } = req.body;
    if (!movieId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // TODO: Integrate with real BTCPay server
    res.json({
      invoiceUrl: `https://your-btcpay-server.com/invoice/${movieId}`,
      invoiceId: `inv_${Date.now()}`,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
}) as RequestHandler);

// ✅ Example Database Route (Check if connected)
app.get("/api/movies", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM movies LIMIT 120;");
    res.json(result.rows);
  } catch (error) {
    console.error("DB Query Error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
