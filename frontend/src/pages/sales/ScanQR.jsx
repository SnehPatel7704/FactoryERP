import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import Loader from '../../components/ui/Loader';

export default function ScanQR() {
  const [sku, setSku] = useState('');
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const html5QrRef = useRef(null);
  const readerId = 'html5qr-reader';
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = async (e) => {
    e?.preventDefault();
    setError(null);
    setResult(null);
    const payload = {};
    if (id) payload.id = id;
    else if (sku) payload.sku = sku;
    else return setError('Enter SKU or ID');

    setLoading(true);
    try {
      const res = await apiClient.post('/sales/scan/qr', payload);
      setResult(res);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    setError(null);
    setResult(null);
    try {
      const mod = await import('html5-qrcode');
      const { Html5Qrcode } = mod;
      const elId = readerId;
      // get cameras
      let cameras = [];
      try {
        cameras = await Html5Qrcode.getCameras();
      } catch (e) {
        // ignore
      }

      const cameraId = (cameras && cameras[0] && cameras[0].id) || null;
      setAvailableCameras(cameras || []);
      const saved = localStorage.getItem('scan.selectedCamera');
      const initial = saved || cameraId || null;
      setSelectedCameraId(initial);
      const html5QrCode = new Html5Qrcode(elId);
      html5QrRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          // stop scanner after first successful decode
          try {
            stopScanner();
          } catch (e) {}
          // attempt to parse JSON payload
          let payload = null;
          try {
            payload = JSON.parse(decodedText);
          } catch (e) {
            payload = null;
          }

          if (payload && (payload.id || payload.sku)) {
            setLoading(true);
            try {
              const res = await apiClient.post('/sales/scan/qr', payload);
              setResult(res);
            } catch (err) {
              setError(err.message || String(err));
            } finally {
              setLoading(false);
            }
          } else {
            // heuristics: if looks like uuid, treat as id else sku
            const uuidRegex = /^[0-9a-fA-F-]{36}$/;
            const maybeId = uuidRegex.test(decodedText.trim());
            const body = maybeId ? { id: decodedText.trim() } : { sku: decodedText.trim() };
            setLoading(true);
            try {
              const res = await apiClient.post('/sales/scan/qr', body);
              setResult(res);
            } catch (err) {
              setError(err.message || String(err));
            } finally {
              setLoading(false);
            }
          }
        },
        (errorMessage) => {
          // ignore decode errors
        }
      );

      setScanning(true);
    } catch (err) {
      setError('Camera access failed: ' + (err.message || err));
    }
  };

  const handleCameraChange = async (e) => {
    const id = e.target.value || null;
    setSelectedCameraId(id);
    try { localStorage.setItem('scan.selectedCamera', id || ''); } catch(e) {}
    if (scanning) {
      // restart scanner with new camera
      await stopScanner();
      const mod = await import('html5-qrcode');
      const { Html5Qrcode } = mod;
      const html5QrCode = new Html5Qrcode(readerId);
      html5QrRef.current = html5QrCode;
      try {
        await html5QrCode.start(id, { fps: 10, qrbox: 250 }, async (decodedText) => {
          try { await stopScanner(); } catch (e) {}
          // reuse existing decode handling by calling startScanner's logic via manual invocation
          let payload = null;
          try { payload = JSON.parse(decodedText); } catch (e) { payload = null; }
          const body = payload && (payload.id || payload.sku) ? payload : (/^[0-9a-fA-F-]{36}$/.test(decodedText.trim()) ? { id: decodedText.trim() } : { sku: decodedText.trim() });
          setLoading(true);
          try {
            const res = await apiClient.post('/sales/scan/qr', body);
            setResult(res);
          } catch (err) {
            setError(err.message || String(err));
          } finally {
            setLoading(false);
          }
        }, (err) => {})
        setScanning(true);
      } catch (err) {
        setError('Camera start failed: ' + (err.message || err));
      }
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ''));
      pushToast('Copied');
    } catch (e) {
      pushToast('Copy failed');
    }
  };

  const pushToast = (msg) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter(tt => tt.id !== id)), 1800);
  };

  const stopScanner = async () => {
    try {
      const inst = html5QrRef.current;
      if (inst) {
        await inst.stop();
        try {
          inst.clear();
        } catch (e) {}
        html5QrRef.current = null;
      }
    } catch (e) {
      // ignore
    }
    setScanning(false);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Scan / Lookup QR</h2>

      <div className="grid md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex flex-col justify-start">
          <form onSubmit={handleLookup} className="space-y-4 w-full">
            <div>
              <label className="block text-sm font-medium text-slate-300">SKU</label>
              <input value={sku} onChange={e=>setSku(e.target.value)} placeholder="SKU-..." className="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Or Production ID</label>
              <input value={id} onChange={e=>setId(e.target.value)} placeholder="uuid or id" className="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded shadow">
                {loading ? 'Looking up…' : 'Lookup'}
              </button>
              <button type="button" onClick={() => { setSku(''); setId(''); setResult(null); setError(null); }} className="px-3 py-2 bg-slate-700 text-white rounded">
                Clear
              </button>
              <div className="text-sm text-slate-400">Or paste decoded QR text and press Lookup.</div>
            </div>
          </form>
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-3 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={scanning ? stopScanner : startScanner} className={`px-4 py-2 rounded font-semibold ${scanning ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'}`}>
                {scanning ? 'Stop Camera' : 'Start Camera Scan'}
              </button>
              {availableCameras && availableCameras.length > 0 && (
                <select value={selectedCameraId || ''} onChange={handleCameraChange} className="bg-slate-800 text-sm text-white rounded border border-slate-700 px-2 py-1">
                  {availableCameras.map(cam => (
                    <option key={cam.id} value={cam.id}>{cam.label || cam.id}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="text-sm text-slate-400">Allow camera access when prompted.</div>
          </div>

          <div className="w-full flex items-center justify-center">
            <div id={readerId} className="bg-black rounded overflow-hidden w-full" style={{ maxWidth: 520, height: 340 }} />
          </div>

          <div className="mt-3 text-xs text-slate-500 text-center">If camera is unavailable, use manual input on the left.</div>
        </div>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      {/* Toasts */}
      {toasts.map(t => (
        <div key={t.id} className="fixed right-4 bottom-6 z-50">
          <div className="bg-black/80 text-white px-4 py-2 rounded shadow">{t.msg}</div>
        </div>
      ))}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">Production Entry</h3>
            {result.productionEntry ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-3"><strong>SKU:</strong> <span className="font-mono ml-2">{result.productionEntry.sku || '—'}</span>
                    {result.productionEntry.sku && <button onClick={() => copyToClipboard(result.productionEntry.sku)} className="ml-2 text-xs px-2 py-1 bg-slate-700 rounded">Copy</button>}
                  </div>
                  <div className="flex items-center gap-3"><strong>ID:</strong> <span className="ml-2">{result.productionEntry.id || '—'}</span>
                    {result.productionEntry.id && <button onClick={() => copyToClipboard(result.productionEntry.id)} className="ml-2 text-xs px-2 py-1 bg-slate-700 rounded">Copy</button>}
                  </div>
                  <div><strong>Item:</strong> <span className="ml-2">{result.productionEntry.item?.name || '—'}</span></div>
                  <div><strong>Size:</strong> <span className="ml-2">{result.productionEntry.size?.value || result.productionEntry.sizeId || '—'}</span></div>
                  <div><strong>Quality:</strong> <span className="ml-2">{result.productionEntry.quality?.grade || result.productionEntry.qualityId || '—'}</span></div>
                  <div><strong>Primary Color:</strong> <span className="ml-2">{result.productionEntry.color?.name || '—'}</span></div>
                </div>
                <div className="space-y-2">
                  <div><strong>Weight (Kg):</strong> <span className="ml-2">{(result.productionEntry.weightId ?? result.productionEntry.weight) || '—'}</span></div>
                  <div><strong>Length (m):</strong> <span className="ml-2">{(result.productionEntry.lengthMeter ?? result.productionEntry.meterId) || '—'}</span></div>
                  <div><strong>Status:</strong> <span className="ml-2">{result.productionEntry.status || '—'}</span></div>
                  <div><strong>Entry Date:</strong> <span className="ml-2">{result.productionEntry.entryDate ? new Date(result.productionEntry.entryDate).toLocaleString() : '—'}</span></div>
                  <div><strong>Batch:</strong> <span className="ml-2">{result.productionEntry.batchNumber || '—'}</span></div>
                  <div><strong>Operator:</strong> <span className="ml-2">{result.productionEntry.operatorId || '—'}</span></div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">No production entry data</div>
            )}
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">Sales Order</h3>
            {result.salesOrder ? (
                <div className="text-sm text-slate-200">
                <div className="mb-2 flex items-center gap-3"><strong>Order:</strong> <span className="ml-2 font-mono">{result.salesOrder.orderNumber || result.salesOrder.id}</span>
                  {result.salesOrder && (result.salesOrder.orderNumber || result.salesOrder.id) && (
                    <button onClick={() => copyToClipboard(result.salesOrder.orderNumber || result.salesOrder.id)} className="ml-2 text-xs px-2 py-1 bg-slate-700 rounded">Copy</button>
                  )}
                </div>
                <div className="mb-2"><strong>Customer:</strong> <span className="ml-2">{result.salesOrder.customerName || '—'}</span></div>
                <div className="mb-2"><strong>Status:</strong> <span className="ml-2">{result.salesOrder.status || '—'}</span></div>
                <div className="mb-2"><strong>Line Items:</strong></div>
                <div className="overflow-auto rounded bg-slate-900 p-2">
                  {result.salesOrder.lineItems && result.salesOrder.lineItems.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400 text-xs">
                          <th className="text-left px-2">Item</th>
                          <th className="text-left px-2">Size</th>
                          <th className="text-left px-2">Quality</th>
                          <th className="text-right px-2">Weight</th>
                          <th className="text-right px-2">Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.salesOrder.lineItems.map(li => (
                          <tr key={li.id} className="border-t border-slate-700">
                            <td className="px-2 py-1">{li.item?.name || li.itemId || '—'}</td>
                            <td className="px-2 py-1">{li.size?.value || li.sizeId || '—'}</td>
                            <td className="px-2 py-1">{li.quality?.grade || li.qualityId || '—'}</td>
                            <td className="px-2 py-1 text-right">{li.weightId ?? '—'}</td>
                            <td className="px-2 py-1 text-right">{li.lengthMeter ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-sm text-slate-400">No line items</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">No sales order linked</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
