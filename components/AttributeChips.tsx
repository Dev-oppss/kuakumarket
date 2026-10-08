export default function AttributeChips({
  items,
}: {
  items: { label: string; value: string }[]
}) {
  if (!items.length) return null
  return (
    <div className="mt-4.5 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.label}
          className="rounded-full bg-blush px-3.5 py-1.5 text-xs font-semibold text-ink"
        >
          <b className="text-rose-deep">{item.label} :</b> {item.value}
        </span>
      ))}
    </div>
  )
}
