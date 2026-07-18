export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "Aucune image fournie." }, { status: 400 });
    }

    // 1. Get the Gemini API key from database
    const setting = await prisma.globalSetting.findUnique({
      where: { key: "gemini_api_key" }
    });

    if (!setting || !setting.value) {
      return NextResponse.json({ success: false, error: "La clé API Gemini n'est pas configurée par l'administrateur." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(setting.value);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Prepare images for Gemini
    const imageParts = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: file.type,
          },
        };
      })
    );

    // 3. System Prompt
    const prompt = `
Tu es un expert en e-commerce. Analyse cette/ces photo(s) de produit.
Je veux que tu me retournes un objet JSON avec exactement ces deux clés :
- "name" : Le nom commercial court et précis du produit (ex: "Coca-Cola 1.5L", "Shampooing L'Oréal 250ml").
- "description" : Une description attrayante du produit, incluant les caractéristiques visibles (poids, volume, ingrédients principaux, utilité).

IMPORTANT: 
- Ne retourne QUE l'objet JSON brut. 
- Ne mets pas de balises \`\`\`json au début ou à la fin.
- Assure-toi que la réponse soit un JSON valide parsable par JSON.parse().
    `;

    // 4. Call Gemini
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text().trim();

    // Remove markdown code blocks if the model accidentally includes them
    let cleanJson = text;
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/```json/g, "").replace(/```/g, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/```/g, "").trim();
    }

    // 5. Parse and return
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({ 
      success: true, 
      name: parsedData.name || "", 
      description: parsedData.description || "" 
    });

  } catch (error: any) {
    console.error("Erreur API Gemini:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de l'analyse de l'image par l'IA." }, { status: 500 });
  }
}
