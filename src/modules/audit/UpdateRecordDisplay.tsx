import React from "react";
import { formatSnakeCase } from "../../utils/format";

function UpdateRecordDisplay({ data }) {
  return (
    <div>
      <div>
        <p className="font-[600] text-center">{data?.action ?? "--"}</p>
        <p className="mx-auto max-w-[396px] text-center font-[400] text-[#55555C]">
          {data?.description ?? "--"}
        </p>
        <p className=" text-center "> Changed By: {data?.changedBy}</p>
      </div>
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h1 className="text-center">Update</h1>
        {data?.data &&
          Object.entries(JSON.parse(data.data)).map(([key, val]) => {
            const { old, new: newVal } = val as { old: any; new: any };

            const parseValue = (input: any): any[] => {
              if (typeof input === "string") {
                try {
                  const parsed = JSON.parse(input);
                  return Array.isArray(parsed) ? parsed : [parsed];
                } catch {
                  return [input]; // fallback if JSON.parse fails
                }
              }
              return Array.isArray(input) ? input : [input];
            };

            const oldItems = parseValue(old);
            const newItems = parseValue(newVal);

            return (
              <div
                key={key}
                className="mx-auto w-[300px] mb-6 border p-4 rounded shadow"
              >
                <h3 className="text-lg font-semibold mb-2 text-neutral-350">
                  {formatSnakeCase(key)}
                </h3>
                <div className="mb-2">
                  <strong>Old:</strong>
                  <ul className="list-disc list-inside">
                    {oldItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>New:</strong>
                  <ul className="list-disc list-inside">
                    {newItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default UpdateRecordDisplay;
