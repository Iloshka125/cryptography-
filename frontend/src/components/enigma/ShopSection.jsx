import PropTypes from 'prop-types';
import Button from '../ui/button.jsx';
import { Coins, Zap, renderIconByValue } from '../IconSet.jsx';

const ShopSection = ({ shopItems, onBuyHints, coins }) => (
  <div className="space-y-6">
    <h2 className="text-2xl text-cyan-300 mb-4">МАГАЗИН</h2>

    <div>
      <h3 className="text-xl text-cyan-200 mb-3">ПОКУПКА ВАЛЮТЫ</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shopItems
          .filter((item) => item.type === 'currency')
          .map((item) => (
            <div
              key={item.id}
              className={`p-6 border-2 rounded-lg bg-[#0a0a0f]/70 transition-all ${
                item.popular
                  ? 'border-amber-300 shadow-[0_0_25px_rgba(255,215,0,0.4)]'
                  : 'border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
              } hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]`}
            >
              {item.popular && (
                <div className="mb-2 text-center">
                  <span className="px-3 py-1 bg-amber-300 text-black text-xs rounded-full">
                    ПОПУЛЯРНОЕ
                  </span>
                </div>
              )}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2 text-cyan-300">
                  {typeof item.icon === 'string' && item.icon.length < 10
                    ? renderIconByValue(item.icon, 'w-10 h-10')
                    : item.type === 'hint' 
                      ? <Zap className="w-10 h-10" />
                      : <Coins className="w-10 h-10" />}
                </div>
                <h4 className="text-lg text-cyan-200">{item.name}</h4>
              </div>
              <Button className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                ${item.price}
              </Button>
            </div>
          ))}
      </div>
    </div>

    <div>
      <h3 className="text-xl text-cyan-200 mb-3">ПОДСКАЗКИ</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shopItems
          .filter((item) => item.type === 'hint')
          .map((item) => (
            <div
              key={item.id}
              className="p-6 border-2 border-cyan-400 rounded-lg bg-[#0a0a0f]/70 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2 text-cyan-300">
                  {typeof item.icon === 'string' && item.icon.length < 10
                    ? renderIconByValue(item.icon, 'w-10 h-10')
                    : item.type === 'hint' 
                      ? <Zap className="w-10 h-10" />
                      : <Coins className="w-10 h-10" />}
                </div>
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
    </div>
  </div>
);

ShopSection.propTypes = {
  shopItems: PropTypes.array.isRequired,
  onBuyHints: PropTypes.func.isRequired,
  coins: PropTypes.number.isRequired,
};

export default ShopSection;

