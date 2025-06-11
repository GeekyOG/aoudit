import React from "react";
import { formatSnakeCase } from "../../utils/format";

const CreateRecordDisplay = ({ activity }) => {
  let parsedData: Record<string, any> = {};
  try {
    parsedData = JSON.parse(activity.data);
  } catch (error) {
    console.error("Error parsing data:", error);
  }

  return (
    <div className="max-w-[396px] mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Activity Details</h2>

      <p>
        <strong>Model:</strong> {activity.model}
      </p>
      <p>
        <strong>Action:</strong> {activity.action}
      </p>
      <p>
        <strong>Changed By:</strong> {activity.changedBy}
      </p>
      <p>
        <strong>Description:</strong> {activity.description}
      </p>

      <h3 className="text-lg font-semibold mt-4">Data:</h3>
      <div className="mt-2 space-y-2">
        {Object.entries(parsedData).map(([key, value]) => (
          <div key={formatSnakeCase(key)}>
            <strong className="capitalize">{formatSnakeCase(key)}:</strong>{" "}
            {Array.isArray(value) ? (
              <ul className="list-disc list-inside ml-4">
                {value.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <span>{String(value)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateRecordDisplay;
