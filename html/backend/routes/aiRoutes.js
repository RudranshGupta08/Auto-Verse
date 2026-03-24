import express from "express";
import Car from "../models/car.js";
import OpenAI from "openai";

const router = express.Router();

// =========================
// 🤖 AI CHAT
// =========================
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // 🔥 CREATE OPENAI INSTANCE HERE (NOT TOP)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const query = message.toLowerCase();
    const cars = await Car.find();

    // =========================
    // 🔍 MATCH CAR
    // =========================
    let matchedCar = null;

    for (let car of cars) {
      const model = car.model.toLowerCase();
      const full = `${car.brand} ${car.model}`.toLowerCase();

      if (query.includes(model) || query.includes(full)) {
        matchedCar = car;
        break;
      }
    }

    if (matchedCar) {
      return res.json({
        reply: `${matchedCar.brand} ${matchedCar.model} is a great choice 🚗 Opening details...`,
        action: "open_car",
        id: matchedCar._id
      });
    }

    // =========================
    // 🧠 CONTEXT FOR AI
    // =========================
    const context = cars.map(c =>
      `${c.brand} ${c.model} | ${c.priceRange} | ${c.mileage}`
    ).join("\n");

    // =========================
    // 🤖 OPENAI CALL
    // =========================
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are AutoVerse AI. Use this data:\n${context}`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const aiReply = response.choices[0].message.content;

    return res.json({
      reply: aiReply,
      action: "search",
      query: message
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI error" });
  }
});

export default router;