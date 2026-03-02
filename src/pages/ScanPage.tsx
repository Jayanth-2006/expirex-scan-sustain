import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle, 
  Languages, 
  Volume2, 
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  Info,
  History,
  Trash2,
  Recycle,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@tanstack/react-router';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

type ScanState = 'idle' | 'capturing' | 'analyzing' | 'result';

export default function ScanPage() {
  const { user } = useAuth();
  const { t, lang, toggleLang } = useLanguage();
  const [state, setState] = useState<ScanState>('idle');
  const [imageFront, setImageFront] = useState<string | null>(null);
  const [imageBack, setImageBack] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [result, setResult] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (currentStep === 1) {
        setImageFront(base64);
        setCurrentStep(2);
      } else {
        setImageBack(base64);
        processScan(imageFront!, base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const processScan = async (front: string, back: string) => {
    setState('analyzing');
    try {
      // 1. Upload images to Blink Storage
      const frontFile = dataURLtoFile(front, `front_${Date.now()}.jpg`);
      const backFile = dataURLtoFile(back, `back_${Date.now()}.jpg`);

      const [frontUpload, backUpload] = await Promise.all([
        blink.storage.upload(frontFile, `scans/${user?.id}/front_${Date.now()}.jpg`),
        blink.storage.upload(backFile, `scans/${user?.id}/back_${Date.now()}.jpg`)
      ]);

      // 2. AI Analysis using Blink SDK (OCR + Vision)
      const prompt = `Analyze these two images of a product (front and back). 
      Extract the following information in a structured JSON format:
      1. Product Name
      2. Manufacture Date
      3. Expiry Date
      4. Ingredients
      5. Batch/Lot Number
      6. Physical Condition Analysis (Discoloration, mold, packaging damage)
      7. Authenticity Check (Mismatched fonts, erasure marks, tampering)
      8. Classification: 'Safe' or 'Expired' or 'At Risk'
      9. Three-level Disposal/Reuse Guidance (Reuse options, recycling methods, vendor connections)
      10. Estimated Remaining Shelf Life (in days/months)
      
      The user's preferred language is ${lang === 'te' ? 'Telugu' : 'English'}. Provide descriptions and guidance in that language.`;

      const { text } = await blink.ai.generateText({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image', image: frontUpload.publicUrl },
              { type: "image", image: backUpload.publicUrl }
            ]
          }
        ]
      });

      // Parse AI response
      const { object: extractedData } = await blink.ai.generateObject({
        prompt: `Extract structured data from this analysis: ${text}`,
        schema: {
          type: 'object',
          properties: {
            productName: { type: 'string' },
            manufactureDate: { type: 'string' },
            expiryDate: { type: 'string' },
            status: { type: 'string', enum: ['Safe', 'Expired', 'At Risk'] },
            batchNumber: { type: 'string' },
            spoilageAnalysis: { type: 'string' },
            anomalyDetection: { type: 'string' },
            disposalGuidance: { type: 'string' },
            shelfLife: { type: 'string' }
          },
          required: ['productName', 'status', 'disposalGuidance']
        }
      });

      const finalResult = {
        ...extractedData,
        imageFront: frontUpload.publicUrl,
        imageBack: backUpload.publicUrl,
        fullAnalysis: text
      };

      // 3. Save to database
      const scanId = `scan_${Date.now()}`;
      await blink.db.scans.create({
        id: scanId,
        userId: user?.id,
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
        language: lang
      });

      setResult(finalResult);
      setState('result');
      speakResults(finalResult);
      toast.success('Scan completed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to process scan. Please try again.');
      setState('idle');
      setCurrentStep(1);
    }
  };

  const speakResults = (data: any) => {
    if (!window.speechSynthesis) return;
    
    const textToSpeak = lang === 'en' 
      ? `Product: ${data.productName}. Status: ${data.status}. Guidance: ${data.disposalGuidance}`
      : `ఉత్పత్తి: ${data.productName}. స్థితి: ${data.status === 'Safe' ? 'సురక్షితం' : 'గడువు ముగిసింది'}. సూచన: ${data.disposalGuidance}`;
      
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'en' ? 'en-US' : 'te-IN';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const resetScan = () => {
    setState('idle');
    setCurrentStep(1);
    setImageFront(null);
    setImageBack(null);
    setResult(null);
    window.speechSynthesis.cancel();
  };

  const handleToggleLang = () => {
    toggleLang();
    toast.success(lang === 'en' ? 'భాష తెలుగుకి మార్చబడింది' : 'Language set to English');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12 animate-in pb-32">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/dashboard">
              <ArrowLeft className="w-6 h-6" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Product Scanner</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={handleToggleLang} 
          className="rounded-full gap-2 border-primary/20 bg-primary/5 text-primary"
        >
          <Languages className="w-4 h-4" />
          {lang.toUpperCase()}
        </Button>
      </header>

      {state === 'idle' && (
        <div className="space-y-8 animate-in">
          <Card className="border-none shadow-xl glass-card overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[3/4] sm:aspect-video bg-emerald-900/5 flex flex-col items-center justify-center p-8 relative overflow-hidden group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/30" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/30" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/30" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg emerald-glow mb-6 transform group-hover:scale-110 transition-transform">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {currentStep === 1 ? 'Capture Front View' : 'Capture Back View'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {currentStep === 1 
                      ? 'Ensure the brand name and expiry label are clearly visible.' 
                      : 'Capture ingredients and lot numbers for authenticity verification.'}
                  </p>
                  
                  <div className="mt-8 flex items-center gap-2">
                    <Badge variant="outline" className={cn("px-4 py-1 rounded-full", currentStep === 1 ? "bg-primary/20 text-primary border-primary" : "bg-muted text-muted-foreground")}>Step 1</Badge>
                    <div className="w-8 h-[1px] bg-muted" />
                    <Badge variant="outline" className={cn("px-4 py-1 rounded-full", currentStep === 2 ? "bg-primary/20 text-primary border-primary" : "bg-muted text-muted-foreground")}>Step 2</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Multi-layer authenticity verification checks.</p>
            </div>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Volume2 className="w-5 h-5" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Automatic voice feedback in your preferred language.</p>
            </div>
          </div>
        </div>
      )}

      {state === 'analyzing' && (
        <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-in text-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-[32px] border-4 border-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-16 h-16 text-primary animate-pulse" />
            </div>
            <div className="absolute inset-0 w-32 h-32 rounded-[32px] border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold mb-2 tracking-tight">Analyzing Product...</h3>
            <p className="text-muted-foreground">Running OCR detection, spoilage analysis, and anomaly checks.</p>
          </div>
          
          <div className="w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse" />
          </div>
        </div>
      )}

      {state === 'result' && result && (
        <div className="space-y-6 animate-in pb-12">
          <div className={cn(
            "p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden",
            result.status === 'Safe' ? "bg-primary text-white" : result.status === 'Expired' ? "bg-destructive text-white" : "bg-accent text-accent-foreground"
          )}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                {result.status === 'Safe' ? <CheckCircle2 className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">{result.status.toUpperCase()}</h2>
                <p className="font-medium opacity-90">{result.productName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/20" onClick={() => speakResults(result)}>
                <Volume2 className={cn("w-6 h-6", isSpeaking && "animate-pulse")} />
              </Button>
              <Button className="bg-white text-black hover:bg-white/90 rounded-2xl px-8 font-bold" onClick={resetScan}>
                Scan Next
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm glass-card">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-muted">
                  <span className="text-xs text-muted-foreground">Expiry Date</span>
                  <span className="font-bold text-sm">{result.expiryDate || 'Not detected'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-muted">
                  <span className="text-xs text-muted-foreground">Batch Number</span>
                  <span className="font-bold text-sm">{result.batchNumber || 'Not detected'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-muted">
                  <span className="text-xs text-muted-foreground">Shelf Life</span>
                  <span className="font-bold text-sm text-primary">{result.shelfLife || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-2">Anomaly Check</span>
                  <p className="text-xs leading-relaxed bg-muted/50 p-3 rounded-xl italic">
                    {result.anomalyDetection || 'No packaging tampering detected.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm glass-card overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Disposal & Sustainability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold mb-1">Reuse Options</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{result.disposalGuidance}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button variant="outline" className="rounded-xl h-20 flex-col gap-2 bg-emerald-50 text-emerald-700 border-emerald-100">
                    <Recycle className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Recycle Plan</span>
                  </Button>
                  <Button variant="outline" className="rounded-xl h-20 flex-col gap-2 bg-destructive/5 text-destructive border-destructive/10">
                    <Trash2 className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Vendor Pickup</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm glass-card overflow-hidden">
             <CardHeader className="p-6">
                <CardTitle className="text-sm font-bold">Analysis Visuals</CardTitle>
             </CardHeader>
             <CardContent className="p-6 pt-0 flex gap-4 overflow-x-auto pb-4">
                <div className="w-40 aspect-square rounded-2xl overflow-hidden flex-shrink-0 border shadow-sm">
                  <img src={result.imageFront} alt="Front" className="w-full h-full object-cover" />
                </div>
                <div className="w-40 aspect-square rounded-2xl overflow-hidden flex-shrink-0 border shadow-sm">
                  <img src={result.imageBack} alt="Back" className="w-full h-full object-cover" />
                </div>
             </CardContent>
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
