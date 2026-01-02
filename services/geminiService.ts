import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, RiskLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    riskLevel: {
      type: Type.STRING,
      enum: [RiskLevel.SAFE, RiskLevel.CAUTION, RiskLevel.HIGH_RISK, RiskLevel.UNKNOWN],
      description: "The calculated risk level based on the input."
    },
    trustScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 indicating trustworthiness (100 is safest)."
    },
    recipientName: {
      type: Type.STRING,
      description: "The name of the entity or person detected, or 'Unknown'."
    },
    recipientId: {
      type: Type.STRING,
      description: "The decoded phone number, UPI ID, URL, or wallet address."
    },
    flags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific red flags or green flags found (max 4)."
    },
    reasoning: {
      type: Type.STRING,
      description: "A concise executive summary of the security analysis."
    }
  },
  required: ["riskLevel", "trustScore", "recipientName", "recipientId", "flags", "reasoning"]
};

export const analyzeRisk = async (
  input: File | string
): Promise<AnalysisResult> => {
  const isImage = input instanceof File;
  
  const modelName = isImage ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview';

  let parts: any[] = [];
  let promptText = "";

  if (isImage) {
    const base64Data = await fileToGenerativePart(input);
    parts.push({
      inlineData: {
        mimeType: input.type,
        data: base64Data
      }
    });
    promptText = `
      Act as a Senior Fraud Detection Analyst. Analyze this image (QR Code or Payment Screen).
      1. EXTRACT: Decode the QR code content (URL, UPI ID, Wallet Address) or read the recipient details.
      2. ANALYZE: Check for phishing patterns, lookalike domains (e.g., paypa1.com), or known scam wallet formats.
      3. VISUALS: If it's a screenshot, look for font inconsistencies indicating editing.
      4. SCORE: 
         - 80-100: Verified Corporate/Merchant patterns (e.g. verified business QR).
         - 50-79: Personal accounts with no obvious red flags.
         - 0-49: Suspicious URLs, mismatched names, or "get rich quick" context.
    `;
  } else {
    promptText = `
      Act as a Senior Fraud Detection Analyst. Analyze this payment identifier: "${input}".
      
      1. IDENTIFY FORMAT:
         - UPI ID (e.g., name@bank)
         - Email (PayPal/Zelle)
         - Phone Number
         - Crypto Address (ETH/BTC/SOL)
         - URL (Payment Link)

      2. HEURISTICS & CHECKS:
         - Random strings of alphanumeric characters are riskier than standard names.
         - Official support handles (e.g. "support@bank") are often spoofed. Check for typos.
         - For Crypto: Check if it matches known burn addresses or high-risk scam patterns.
         - For UPI/Email: Does it look like a generated temporary ID?

      3. OUTPUT: Provide a Trust Score based on the format legitimacy and likelihood of it being a scam.
    `;
  }

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are VeriPay Guard's central security core. You analyze payment endpoints for fraud. Be conservative with trust scores. If unsure, flag as Caution.",
        temperature: 0.3, 
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text) as AnalysisResult;
      return { ...result, timestamp: Date.now() };
    }
    
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      riskLevel: RiskLevel.UNKNOWN,
      trustScore: 0,
      recipientName: "System Error",
      recipientId: typeof input === 'string' ? input : "Scan Failed",
      flags: ["Connection Error"],
      reasoning: "Unable to reach the security core. Please check your internet connection and try again.",
      timestamp: Date.now()
    };
  }
};

const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};