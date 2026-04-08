/**
 * Reusable flash-sale style blocks for e‑commerce UIs.
 * Not used by the document app — copy into your shop project.
 */
import { motion } from 'framer-motion';

export function FlashSaleProductCard({
  name,
  imageUrl,
  originalPrice,
  salePrice,
  percentOff,
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="relative max-w-xs overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-xl"
    >
      <div className="absolute right-3 top-3 z-10 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
        {percentOff}% OFF
      </div>
      <div className="aspect-[4/3] bg-zinc-800">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white">{name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-amber-300">${salePrice}</span>
          <span className="text-sm text-zinc-500 line-through">${originalPrice}</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30"
          type="button"
        >
          Buy now
        </motion.button>
      </div>
    </motion.article>
  );
}

export function CartLineWithDiscount({ title, was, now }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
      <span className="text-sm text-zinc-200">{title}</span>
      <div className="text-right text-sm">
        <span className="text-zinc-500 line-through">${was}</span>
        <span className="ml-2 font-semibold text-emerald-400">${now}</span>
      </div>
    </div>
  );
}
