import React from 'react';

export default function Toast({ message }) {
  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="bg-black/80 text-white px-4 py-2 rounded shadow">{message}</div>
    </div>
  );
}
