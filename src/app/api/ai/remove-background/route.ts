export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "Aucune image fournie." }, { status: 400 });
    }

    // Récupérer la clé API (Gemini / Imagen Ecosystem)
    const setting = await prisma.globalSetting.findUnique({
      where: { key: "gemini_api_key" }
    });

    if (!setting || !setting.value) {
      return NextResponse.json({ success: false, error: "La clé API Gemini n'est pas configurée par l'administrateur." }, { status: 500 });
    }

    // ============================================================================
    // INTEGRATION BACKGROUND REMOVAL (ECOSYSTEME GEMINI / IMAGEN / NANO BANANA)
    // Actuellement, le SDK @google/generative-ai public est orienté texte/multimodal.
    // Pour le détourage réel en production, on utilise l'API Vertex AI (Imagen EditImage)
    // ou on connecte le service Banana.dev / Remove.bg selon votre architecture exacte.
    // ============================================================================
    
    // Pour l'instant, on simule le traitement en uploadant la première image
    // sur Supabase et on la retourne comme si elle avait été détourée.
    const fileToProcess = files[0];
    const arrayBuffer = await fileToProcess.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // TODO: Appeler l'API de détourage ici avec le buffer.
    // const processedBuffer = await callGeminiImagenOrBananaAPI(buffer, setting.value);
    const processedBuffer = buffer; // Simulation: on garde l'image d'origine pour l'instant

    // Upload vers Supabase Storage
    const fileName = `processed_${Date.now()}_${fileToProcess.name.replace(/\s+/g, '_')}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, processedBuffer, {
        contentType: fileToProcess.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      return NextResponse.json({ success: false, error: "Erreur lors de la sauvegarde de l'image détourée." }, { status: 500 });
    }

    // Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(uploadData.path);

    return NextResponse.json({ 
      success: true, 
      url: publicUrlData.publicUrl
    });

  } catch (error: any) {
    console.error("Erreur API Background Removal:", error);
    return NextResponse.json({ success: false, error: "Erreur lors du détourage de l'image." }, { status: 500 });
  }
}
