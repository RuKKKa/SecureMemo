import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, X, KeyRound, AlertCircle, Delete, CornerDownLeft } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'unlock' | 'set';
  memoTitle?: string;
  onSubmit: (pin: string) => Promise<boolean>;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  mode,
  memoTitle,
  onSubmit,
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [activeField, setActiveField] = useState<'pin' | 'confirm'>('pin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setConfirmPin('');
      setActiveField('pin');
      setError('');
      setIsLoading(false);
      // モーダル表示時にPCでは即座にフォーカス
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (activeField === 'confirm') {
      if (confirmPin.length < 8) {
        setConfirmPin(prev => prev + num);
        setError('');
      }
    } else {
      if (pin.length < 8) {
        setPin(prev => prev + num);
        setError('');
      }
    }
  };

  const handleBackspace = () => {
    if (activeField === 'confirm') {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
    setError('');
  };

  const handleClear = () => {
    if (activeField === 'confirm') {
      setConfirmPin('');
    } else {
      setPin('');
    }
    setError('');
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin || pin.length < 4) {
      setError('PINは4文字以上で入力してください');
      return;
    }

    if (mode === 'set') {
      if (pin !== confirmPin) {
        setError('確認用PINが一致しません');
        return;
      }
    }

    setIsLoading(true);
    setError('');
    try {
      const success = await onSubmit(pin);
      if (!success) {
        setError('PINが正しくありません');
        setPin('');
        setActiveField('pin');
        pinInputRef.current?.focus();
      } else {
        onClose();
      }
    } catch {
      setError('エラーが発生しました。もう一度お試しください');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* ヘッダー */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
              mode === 'unlock' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-brand-600 shadow-brand-500/20'
            }`}>
              {mode === 'unlock' ? <Lock className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {mode === 'unlock' ? 'メモのロック解除' : 'PINコードを設定'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'unlock' ? '閲覧・編集のためのPINを入力' : 'メモをAES-GCMで暗号化します'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォームエリア */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
          {memoTitle && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 truncate">
              対象: <span className="font-medium text-slate-900 dark:text-white">{memoTitle}</span>
            </div>
          )}

          {/* PIN入力欄 */}
          <div className="space-y-3">
            {/* キーボード用入力インプット */}
            <div>
              <input
                ref={pinInputRef}
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pin}
                onFocus={() => setActiveField('pin')}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="PINを入力 (8文字以内)"
                className={`w-full text-center tracking-widest text-lg font-mono px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none transition-colors ${
                  activeField === 'pin'
                    ? 'border-brand-500 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
                autoFocus
              />
            </div>

            {mode === 'set' && (
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={confirmPin}
                  onFocus={() => setActiveField('confirm')}
                  onChange={(e) => {
                    setConfirmPin(e.target.value);
                    setError('');
                  }}
                  placeholder="確認用PINを再入力"
                  className={`w-full text-center tracking-widest text-base font-mono px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none transition-colors ${
                    activeField === 'confirm'
                      ? 'border-brand-500 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
            )}

            {/* PC向けショートカットヒント（PCでのみ表示） */}
            <div className="hidden md:flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              <span>キーボード入力に対応</span>
              <span>・</span>
              <span className="flex items-center gap-0.5 font-medium text-slate-500 dark:text-slate-400">
                <CornerDownLeft className="w-3 h-3" /> Enterで決定
              </span>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-800/40 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* スマホ用キーパッド（PC画面では非表示: md:hidden） */}
          <div className="md:hidden grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-lg transition-transform flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-2xl text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
            >
              クリア
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 font-semibold text-lg transition-transform flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-2xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* 確定アクション */}
          <button
            type="submit"
            disabled={isLoading || pin.length < 4 || (mode === 'set' && confirmPin.length < 4)}
            className={`w-full py-3 rounded-2xl font-semibold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isLoading || pin.length < 4 || (mode === 'set' && confirmPin.length < 4)
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                : 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/30 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === 'unlock' ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>解除する</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>暗号化してロック</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
