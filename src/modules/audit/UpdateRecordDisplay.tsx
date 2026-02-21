import React from "react";
import { ArrowRight } from "lucide-react";
import { formatSnakeCase } from "../../utils/format";

const DiffBadge = ({
  items,
  variant,
}: {
  items: any[];
  variant: "old" | "new";
}) => {
  const styles = {
    old: "bg-red-50 text-red-700 border-red-100 line-through decoration-red-400",
    new: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  if (items.length === 0) {
    return <span className="text-gray-400 text-xs italic">empty</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, idx) => (
        <span
          key={idx}
          className={`inline-block text-xs px-2 py-0.5 rounded-md border font-mono ${styles[variant]}`}
        >
          {String(item ?? "null")}
        </span>
      ))}
    </div>
  );
};

const ScalarDiff = ({ oldVal, newVal }: { oldVal: any; newVal: any }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-xs px-2.5 py-1 rounded-lg bg-red-50 border border-red-100 text-red-700 font-mono line-through decoration-red-400">
      {String(oldVal)}
    </span>
    <ArrowRight size={14} className="text-gray-400 shrink-0" />
    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono">
      {String(newVal)}
    </span>
  </div>
);

function UpdateRecordDisplay({ data }: { data: any }) {
  const parsed: Record<string, { old: any; new: any }> = (() => {
    try {
      return JSON.parse(data.data);
    } catch {
      return {};
    }
  })();

  const parseValue = (input: any): any[] => {
    if (typeof input === "string") {
      try {
        const p = JSON.parse(input);
        return Array.isArray(p) ? p : [p];
      } catch {
        return [input];
      }
    }
    return Array.isArray(input) ? input : [input];
  };

  const fields = Object.entries(parsed);

  return (
    <div className="px-6 py-5">
      <p className="text-sm text-gray-500 mb-5 text-center">
        {data?.description}
      </p>

      <div className="space-y-4">
        {fields.map(([key, val]) => {
          const { old: oldRaw, new: newRaw } = val;
          const oldArr = parseValue(oldRaw);
          const newArr = parseValue(newRaw);
          const isArray =
            Array.isArray(oldRaw) ||
            (typeof oldRaw === "string" &&
              (() => {
                try {
                  return Array.isArray(JSON.parse(oldRaw));
                } catch {
                  return false;
                }
              })()) ||
            Array.isArray(oldRaw);
          const isScalar = !isArray && !Array.isArray(oldArr);

          // Detect if this is a simple scalar (number/string non-array)
          const looksScalar =
            oldArr.length === 1 &&
            newArr.length === 1 &&
            !Array.isArray(oldRaw) &&
            typeof oldRaw !== "string";

          return (
            <div
              key={key}
              className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm"
            >
              {/* Field label */}
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {formatSnakeCase(key)}
                </span>
              </div>

              <div className="px-4 py-3 space-y-3">
                {looksScalar ? (
                  <ScalarDiff oldVal={oldRaw} newVal={newRaw} />
                ) : (
                  <>
                    {/* Removed items */}
                    {(() => {
                      const removed = oldArr.filter(
                        (item) => !newArr.includes(item) && item !== null,
                      );
                      const added = newArr.filter(
                        (item) => !oldArr.includes(item) && item !== null,
                      );
                      const unchanged = newArr.filter(
                        (item) => oldArr.includes(item) && item !== null,
                      );

                      return (
                        <div className="space-y-2.5">
                          {removed.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-1.5">
                                Removed
                              </p>
                              <DiffBadge items={removed} variant="old" />
                            </div>
                          )}
                          {added.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 mb-1.5">
                                Added
                              </p>
                              <DiffBadge items={added} variant="new" />
                            </div>
                          )}
                          {unchanged.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                                Unchanged
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {unchanged.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 rounded-md border border-gray-100 bg-gray-50 text-gray-500 font-mono"
                                  >
                                    {String(item)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UpdateRecordDisplay;
