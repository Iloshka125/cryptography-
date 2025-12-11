import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog.jsx';
import Button from '../ui/button.jsx';
import { Coins, Zap } from '../IconSet.jsx';

const ShopDialog = ({ open, onOpenChange, shopItems, onBuyHints, coins, showToast }) => {
  const [activeTab, setActiveTab] = useState('coins');
  const currencyItems = shopItems.filter((item) => item.type === 'currency');
  const hintItems = shopItems.filter((item) => item.type === 'hint');

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-[#0f0f1a] border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.3)] backdrop-blur-xl">
        <DialogHeader className="!border-b-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] text-2xl">
                МАГАЗИН
              </DialogTitle>
              <DialogDescription className="text-cyan-200">
                Покупайте монеты и подсказки для прогресса
              </DialogDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="ml-4 text-cyan-300 hover:text-cyan-100 transition-colors text-2xl font-bold leading-none p-1 hover:bg-cyan-400/20 rounded"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="mt-6 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('coins')}
            className={`flex-1 py-3 px-4 text-center transition-all rounded ${
              activeTab === 'coins'
                ? 'bg-cyan-400 text-black font-semibold'
                : 'text-cyan-200 hover:text-cyan-300 hover:bg-cyan-400/10'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Coins className="w-5 h-5" />
              Монеты
            </span>
          </button>
          <button
            onClick={() => setActiveTab('hints')}
            className={`flex-1 py-3 px-4 text-center transition-all rounded ${
              activeTab === 'hints'
                ? 'bg-cyan-400 text-black font-semibold'
                : 'text-cyan-200 hover:text-cyan-300 hover:bg-cyan-400/10'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Подсказки
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="pb-4">
          {activeTab === 'coins' && (
            <div className="flex flex-wrap justify-between mx-10 gap-y-6">
              {currencyItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-10 rounded-lg bg-[#0a0a0f]/50 hover:bg-[#0a0a0f]/70 transition-all relative max-w-[330px] w-full ${
                    item.popular
                      ? 'shadow-[0_0_25px_rgba(255,215,0,0.4)]'
                      : 'shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                  }`}
                >
                  {item.popular && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-amber-300 text-black text-xs rounded-full font-semibold">
                        ПОПУЛЯРНО
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <h4 className="text-lg text-cyan-200">{item.name}</h4>
                  </div>
                  <Button
                    onClick={() => showToast?.(`Покупка: ${item.name}`, 'success')}
                    className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                  >
                    ${item.price}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'hints' && (
            <div className="flex flex-wrap justify-between mx-10 gap-y-6">
              {hintItems.map((item) => (
                <div
                  key={item.id}
                  className="p-10 rounded-lg bg-[#0a0a0f]/50 hover:bg-[#0a0a0f]/70 transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] max-w-[330px] w-full"
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <h4 className="text-lg text-cyan-200">{item.name}</h4>
                  </div>
                  <Button
                    onClick={() => {
                      const amount = parseInt(item.name.split(' ')[0], 10);
                      onBuyHints(amount, item.coinPrice || 0);
                    }}
                    disabled={coins < (item.coinPrice || 0)}
                    className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Coins className="w-4 h-4" />
                    {item.coinPrice}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

ShopDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  shopItems: PropTypes.array.isRequired,
  onBuyHints: PropTypes.func.isRequired,
  coins: PropTypes.number.isRequired,
  showToast: PropTypes.func,
};

export default ShopDialog;

