import express from "express";

import { detectIntent } from "../services/intentService.js";
import { generateResponse } from "../services/responseService.js";

import { getCarDetails } from "../services/searchService.js";
import { recommendCars } from "../services/recommendationService.js";
import { compareCars } from "../services/comparisonService.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        reply: "Please enter a message."
      });
    }

    const intent = await detectIntent(message);

    console.log("Intent:", intent);

    let result = null;
    let action = null;

    switch (intent.intent) {
      case "details":
        result = await getCarDetails(intent.car);

        if (result) {
          action = "open_car";
        }

        break;

      case "comparison":
        result = await compareCars(
          intent.cars[0],
          intent.cars[1]
        );

        break;

      case "recommendation":
        result = await recommendCars({
          bodyType: intent.bodyType,
          maxPrice: intent.budget
        });

        break;

      default:
        result = {
          note: "General automotive query"
        };
    }

    const reply = await generateResponse(
      message,
      result
    );

    if (
      action === "open_car" &&
      result?._id
    ) {
      return res.json({
        reply,
        action: "open_car",
        id: result._id
      });
    }

    return res.json({
      reply
    });

  } catch (err) {
    console.error("AI Route Error:", err);

    return res.status(500).json({
      reply:
        "Sorry, AutoVerse AI is currently unavailable."
    });
  }
});

export default router;