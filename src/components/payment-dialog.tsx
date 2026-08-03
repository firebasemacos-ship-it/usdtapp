'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CreditCard, Banknote, Percent, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPaymentSuccess: (details: { finalAmount: number, percentage: number }) => void;
}

export function PaymentDialog({ isOpen, onClose, total, onPaymentSuccess }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const [percentage, setPercentage] = useState(0);

  const totalWithPercentage = useMemo(() => {
    if (paymentMethod === 'card' && percentage > 0) {
      return total * (1 + percentage / 100);
    }
    return total;
  }, [total, percentage, paymentMethod]);

  const handlePayment = () => {
    onPaymentSuccess({
        finalAmount: totalWithPercentage,
        percentage: paymentMethod === 'card' ? percentage : 0,
    });
    resetState();
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const resetState = () => {
    setPaymentMethod(null);
    setPercentage(0);
  };

  const displayTotal = paymentMethod === 'card' ? totalWithPercentage : total;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-panel p-6 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl max-w-md">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="font-headline text-2xl font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            إتمام سداد الفاتورة
          </DialogTitle>
          <DialogDescription className="text-sm font-medium">
            اختر طريقة الدفع المناسبة لإنهاء العملية وإصدار الإيصال.
          </DialogDescription>
        </DialogHeader>
        <div className="my-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className={cn(
                "h-24 flex-col gap-2 rounded-2xl transition-all duration-300 font-bold border",
                paymentMethod === 'cash' 
                  ? 'glass-pill-active scale-105 shadow-xl' 
                  : 'glass-pill hover:scale-105'
              )}
              onClick={() => setPaymentMethod('cash')}
            >
              <Banknote className="h-7 w-7" />
              <span className="text-base">نقداً (كاش)</span>
            </Button>
            <Button
              variant="outline"
              className={cn(
                "h-24 flex-col gap-2 rounded-2xl transition-all duration-300 font-bold border",
                paymentMethod === 'card' 
                  ? 'glass-pill-active scale-105 shadow-xl' 
                  : 'glass-pill hover:scale-105'
              )}
              onClick={() => setPaymentMethod('card')}
            >
              <CreditCard className="h-7 w-7" />
              <span className="text-base">بطاقة مصرفية</span>
            </Button>
          </div>

          {paymentMethod === 'card' && (
            <div className="space-y-2 glass-card p-4 rounded-2xl border-white/20">
              <Label htmlFor="percentage" className="font-semibold text-xs text-muted-foreground flex items-center gap-1">
                <Percent className="h-3.5 w-3.5 text-primary" /> إضافة نسبة خَصم أو عمولة (%)
              </Label>
              <div className="relative">
                <Input
                  id="percentage"
                  type="number"
                  placeholder="0%"
                  value={percentage || ''}
                  onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                  className="h-11 glass-input rounded-xl text-base font-bold text-center"
                />
              </div>
            </div>
          )}

          <div className={cn(
            "p-6 text-center rounded-2xl border backdrop-blur-xl transition-all shadow-inner", 
            paymentMethod === 'card' 
              ? "bg-primary/10 border-primary/30" 
              : "bg-emerald-500/10 border-emerald-500/30"
          )}>
            <p className={cn("text-xs uppercase font-bold tracking-wider mb-1", paymentMethod === 'card' ? "text-primary" : "text-emerald-600 dark:text-emerald-400")}>
              {paymentMethod === 'card' ? 'إجمالي المبلغ بعد النسبة' : 'المبلغ المستحق للدفع'}
            </p>
            <p className={cn("text-4xl font-bold font-headline", paymentMethod === 'card' ? "text-primary" : "text-emerald-600 dark:text-emerald-400")}>
              {displayTotal.toLocaleString('ar-LY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xl">ل.د</span>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            size="lg"
            className="w-full h-13 text-base font-bold glass-glow-button text-white rounded-xl"
            onClick={handlePayment}
            disabled={!paymentMethod}
          >
            تأكيد العملية والدفع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
