import React, { useState, useRef } from "react";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Languages,
  Volume2,
  ArrowLeft,
  ShieldCheck,
  Info,
  History,
  Trash2,
  Recycle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { blink } from "@/lib/blink";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

type ScanState = "idle" | "analyzing" | "result";

interface ScanResult {
  productName: string;
  manufactureDate?: string;
  expiryDate?: string;
  status: "Safe" | "Expired" | "At Risk";
  batchNumber?: string;
  spoilageAnalysis?: string;
  anomalyDetection?: string;
  disposalGuidance: string;
  shelfLife?: string;
  imageFront: string;
  imageBack: string;
  fullAnalysis: string;
}

export default function ScanPage() {
  const { user } = useAuth();
  const { lang, toggleLang } = useLanguage();

  const [state, setState] = useState<ScanState>("idle");
  const [imageFront, setImageFront] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- FILE CAPTURE ---------------- */

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      if (currentStep === 1) {
        setImageFront(base64);
        setCurrentStep(2);
      } else if (imageFront) {
        processScan(imageFront, base64);
      }
    };

    reader.readAsDataURL(file);
  };

  /* ---------------- MAIN PROCESS ---------------- */

  const processScan = async (front: string, back: string) => {
    if (!user?.id) {
      toast.error("User not authenticated.");
      return;
    }

    setState("analyzing");

    try {
      const timestamp = Date.now();

      const frontFile = dataURLtoFile(front, `front_${timestamp}.jpg`);
      const backFile = dataURLtoFile(back, `back_${timestamp}.jpg`);

      const [frontUpload, backUpload] = await Promise.all([
        blink.storage.upload(frontFile, `scans/${user.id}/front_${timestamp}.jpg`),
        blink.storage.upload(backFile, `scans/${user.id}/back_${timestamp}.jpg`),
      ]);

      const prompt = `
Analyze these two images of a product (front and back).
Return structured JSON including:
- Product Name
- Manufacture Date
- Expiry Date
- Ingredients
- Batch Number
- Physical Condition
- Authenticity Check
- Classification: Safe | Expired | At Risk
- Disposal Guidance
- Estimated Shelf Life

Language: ${lang === "te" ? "Telugu" : "English"}
`;

      const { object } = await blink.ai.generateObject({
        prompt,
        schema: {
          type: "object",
          properties: {
            productName: { type: "string" },
            manufactureDate: { type: "string" },
            expiryDate: { type: "string" },
            status: { type: "string", enum: ["Safe", "Expired", "At Risk"] },
            batchNumber: { type: "string" },
            spoilageAnalysis: { type: "string" },
            anomalyDetection: { type: "string" },
            disposalGuidance: { type: "string" },
            shelfLife: { type: "string" },
          },
          required: ["productName", "status", "disposalGuidance"],
        },
      });

      const finalResult: ScanResult = {
        ...object,
        imageFront: frontUpload.publicUrl,
        imageBack: backUpload.publicUrl,
        fullAnalysis: JSON.stringify(object),
      };

      await blink.db.scans.create({
        id: `scan_${timestamp}`,
        userId: user.id,
        productName: finalResult.productName,
        imageFront: finalResult.imageFront,
        imageBack: finalResult.imageBack,
        manufactureDate: finalResult.manufactureDate,
        expiryDate: finalResult.expiryDate,
        status: finalResult.status,
        spoilageAnalysis: finalResult.spoilageAnalysis,
        anomalyDetection: finalResult.anomalyDetection,
        disposalGuidance: finalResult.disposalGuidance,
        batchNumber: finalResult.batchNumber,
        shelfLife: finalResult.shelfLife,
        language: lang,
      });

      setResult(finalResult);
      setState("result");
      speakResults(finalResult);

      toast.success("Scan completed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process scan.");
      resetScan();
    }
  };

  /* ---------------- SPEECH ---------------- */

  const speakResults = (data: ScanResult) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const text =
      lang === "en"
        ? `Product: ${data.productName}. Status: ${data.status}. Guidance: ${data.disposalGuidance}`
        : `ఉత్పత్తి: ${data.productName}. స్థితి: ${data.status}. సూచన: ${data.disposalGuidance}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "en" ? "en-US" : "te-IN";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  /* ---------------- UTIL ---------------- */

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(",");
    if (arr.length < 2) throw new Error("Invalid data URL");

    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const bstr = atob(arr[1] || "");
    const u8arr = new Uint8Array(bstr.length);

    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const resetScan = () => {
    setState("idle");
    setCurrentStep(1);
    setImageFront(null);
    setResult(null);
    window.speechSynthesis.cancel();

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      <header className="flex justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-6 h-6" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Product Scanner</h1>
        </div>

        <Button variant="outline" onClick={toggleLang}>
          <Languages className="w-4 h-4 mr-2" />
          {lang.toUpperCase()}
        </Button>
      </header>

      {state === "idle" && (
        <Card className="glass-card cursor-pointer">
          <CardContent
            className="p-10 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
            <p className="font-semibold">
              {currentStep === 1
                ? "Capture Front View"
                : "Capture Back View"}
            </p>
          </CardContent>
        </Card>
      )}

      {state === "analyzing" && (
        <div className="text-center py-20">
          <ShieldCheck className="w-16 h-16 mx-auto text-primary animate-pulse" />
          <p className="mt-4 font-semibold">Analyzing product...</p>
        </div>
      )}

      {state === "result" && result && (
        <div className="space-y-6">
          <Card className="glass-card p-6">
            <h2 className="text-xl font-bold">{result.productName}</h2>
            <p>Status: {result.status}</p>
            <p>Expiry: {result.expiryDate || "Not detected"}</p>
            <p>Batch: {result.batchNumber || "Not detected"}</p>
            <p>Shelf Life: {result.shelfLife || "N/A"}</p>
            <p className="mt-4 text-sm">{result.disposalGuidance}</p>

            <div className="flex gap-3 mt-4">
              <Button onClick={() => speakResults(result)}>
                <Volume2 className={cn("w-4 h-4 mr-2", isSpeaking && "animate-pulse")} />
                Speak
              </Button>
              <Button onClick={resetScan}>Scan Next</Button>
            </div>
          </Card>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleCapture}
        className="hidden"
      />
    </div>
  );
}
