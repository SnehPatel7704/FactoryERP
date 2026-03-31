import React, { useState } from 'react';

const DispatchGeneration = () => {
  return (
    <div className="pt-2 px-8 pb-12 w-full min-h-screen text-slate-100 antialiased">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-500">Dispatch Module</span>
            <h1 className="text-3xl font-extrabold text-white mt-1">Delivery Challan</h1>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-all rounded">
              <span className="material-symbols-outlined text-sm">save</span>
              <span className="text-sm font-bold uppercase tracking-wider">Draft</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-green-500 text-slate-900 shadow-[0_0_15px_rgba(0,200,83,0.3)] hover:brightness-110 transition-all rounded font-bold">
              <span className="material-symbols-outlined">picture_as_pdf</span>
              <span className="text-sm uppercase tracking-wider">Generate PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Data Entry Form */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Customer Details Bento Card */}
            <section className="bg-slate-900 p-6 rounded-lg border border-blue-900/20 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -mr-16 -mt-16"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500"></span> Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Customer Name</label>
                  <select className="w-full bg-slate-800 border-slate-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white rounded-lg text-sm outline-none transition-all">
                    <option>Select Customer</option>
                    <option>Reliance Textiles Ltd.</option>
                    <option>Global Apparel Solutions</option>
                    <option>Evergreen Garments</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">City / Branch</label>
                  <select className="w-full bg-slate-800 border-slate-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white rounded-lg text-sm outline-none transition-all">
                    <option>Select City</option>
                    <option>Mumbai - HQ</option>
                    <option>Surat - Factory</option>
                    <option>Ahmedabad - Warehouse</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Items Entry Table */}
            <section className="bg-slate-900 p-1 rounded-lg border border-blue-900/20 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-blue-900/20">
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-blue-900/10">Item Description</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-blue-900/10">Specs</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-blue-900/10">Color Profile</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-blue-900/10 text-center">Packaging</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Measurements</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/10">
                    <tr className="hover:bg-blue-900/5 transition-colors group">
                      <td className="p-4 align-top space-y-2 border-r border-blue-900/10">
                        <select className="w-full bg-slate-800 border-slate-700 rounded text-sm mb-1 text-white focus:border-green-500 outline-none">
                          <option>Cotton Twill</option>
                        </select>
                        <select className="w-full bg-slate-800 border-slate-700 rounded text-xs text-slate-400 focus:border-green-500 outline-none">
                          <option>Premium Grade A</option>
                        </select>
                      </td>
                      <td className="p-4 align-top space-y-2 border-r border-blue-900/10">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] w-8 text-slate-500">SIZE</span>
                            <select className="flex-1 bg-slate-800 border-slate-700 text-white rounded text-xs py-1 px-2 focus:border-green-500 outline-none">
                              <option>44"</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] w-8 text-slate-500">WGT</span>
                            <input className="flex-1 bg-slate-800 border-slate-700 rounded text-xs py-1 px-2 text-green-500 font-bold focus:border-green-500 outline-none" type="text" defaultValue="220" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top border-r border-blue-900/10">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            <select className="flex-1 bg-transparent border-none p-0 text-xs text-white focus:ring-0 outline-none">
                              <option>Royal Navy</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                            <select className="flex-1 bg-transparent border-none p-0 text-xs text-white focus:ring-0 outline-none">
                              <option>Silver Trim</option>
                            </select>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top border-r border-blue-900/10">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Bags</p>
                            <input className="w-full bg-slate-800 border-slate-700 text-white rounded text-xs text-center py-1 focus:border-green-500 outline-none" type="number" defaultValue="5" />
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Bag Wgt</p>
                            <input className="w-full bg-slate-800 border-slate-700 text-white rounded text-xs text-center py-1 focus:border-green-500 outline-none" type="number" defaultValue="25.4" />
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Rolls</p>
                            <input className="w-full bg-slate-800 border-slate-700 text-white rounded text-xs text-center py-1 focus:border-green-500 outline-none" type="number" defaultValue="12" />
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Mtr/Roll</p>
                            <select className="w-full bg-slate-800 border-slate-700 text-white rounded text-[10px] text-center py-1 focus:border-green-500 outline-none">
                              <option>100</option>
                              <option>150</option>
                            </select>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Total Meter</p>
                        <p className="text-2xl font-black text-white">1,200.0</p>
                        <p className="text-[9px] text-green-500 font-bold">CALCULATED</p>
                      </td>
                    </tr>
                    <tr className="hover:bg-blue-900/5 transition-colors group">
                      <td className="p-4 align-top space-y-2 border-r border-blue-900/10">
                        <select className="w-full bg-slate-800 border-slate-700 rounded text-sm mb-1 text-white focus:border-green-500 outline-none">
                          <option>Heavy Denim</option>
                        </select>
                        <select className="w-full bg-slate-800 border-slate-700 rounded text-xs text-slate-400 focus:border-green-500 outline-none">
                          <option>Rugged 14oz</option>
                        </select>
                      </td>
                      <td className="p-4 align-top space-y-2 border-r border-blue-900/10">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] w-8 text-slate-500">SIZE</span>
                            <select className="flex-1 bg-slate-800 border-slate-700 text-white rounded text-xs py-1 px-2 focus:border-green-500 outline-none">
                              <option>60"</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] w-8 text-slate-500">WGT</span>
                            <input className="flex-1 bg-slate-800 border-slate-700 rounded text-xs py-1 px-2 text-green-500 font-bold focus:border-green-500 outline-none" type="text" defaultValue="450" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top border-r border-blue-900/10">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                            <div className="w-3 h-3 rounded-full bg-black"></div>
                            <select className="flex-1 bg-transparent border-none p-0 text-xs text-white focus:ring-0 outline-none">
                              <option>Obsidian</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                            <div className="w-3 h-3 rounded-full bg-amber-900"></div>
                            <select className="flex-1 bg-transparent border-none p-0 text-xs text-white focus:ring-0 outline-none">
                              <option>Gold Stitch</option>
                            </select>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top border-r border-blue-900/10">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Bags</p>
                            <input className="w-full bg-slate-800 border-slate-700 text-white rounded text-xs text-center py-1 focus:border-green-500 outline-none" type="number" defaultValue="2" />
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Bag Wgt</p>
                            <input className="w-full bg-slate-800 border-slate-700 text-white rounded text-xs text-center py-1 focus:border-green-500 outline-none" type="number" defaultValue="40.0" />
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Rolls</p>
                            <input className="w-full bg-slate-800 border-slate-700 text-white rounded text-xs text-center py-1 focus:border-green-500 outline-none" type="number" defaultValue="8" />
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">Mtr/Roll</p>
                            <select className="w-full bg-slate-800 border-slate-700 text-white rounded text-[10px] text-center py-1 focus:border-green-500 outline-none">
                              <option>50</option>
                              <option>100</option>
                            </select>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Total Meter</p>
                        <p className="text-2xl font-black text-white">400.0</p>
                        <p className="text-[9px] text-green-500 font-bold">CALCULATED</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-blue-900/10 border-t border-blue-900/20 flex justify-between items-center">
                <button className="text-green-500 hover:text-white flex items-center gap-2 text-xs font-bold transition-colors">
                  <span className="material-symbols-outlined text-sm">add_circle</span> ADD NEW ITEM
                </button>
                <div className="flex gap-8 items-center">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase">Total Items</p>
                    <p className="text-lg font-bold text-slate-200">20 Rolls</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase">Grand Total</p>
                    <p className="text-lg font-bold text-green-500">1,600.0 MTR</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Preview Column */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500">visibility</span> LIVE PREVIEW
                </h3>
                <span className="text-[10px] text-slate-500 italic">v1.2 Draft</span>
              </div>
              
              {/* Digital Document Card */}
              <div className="bg-white text-slate-900 rounded-lg p-8 shadow-2xl relative min-h-[600px] flex flex-col font-serif">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <span className="text-9xl font-black rotate-45">DISPATCH</span>
                </div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h4 className="text-2xl font-black tracking-tighter text-black uppercase mb-1">Industrial Slate</h4>
                    <p className="text-[10px] font-sans leading-tight text-slate-500">
                      Industrial Area, Phase IV<br />
                      Maharashtra, IN 400013<br />
                      GSTIN: 27AABCM1234F1Z5
                    </p>
                  </div>
                  <div className="text-right">
                    <h5 className="text-sm font-bold font-sans uppercase bg-slate-100 px-2 py-1 mb-2">Delivery Challan</h5>
                    <p className="text-[10px] font-sans">No: <strong>DC/24/0892</strong></p>
                    <p className="text-[10px] font-sans">Date: <strong>24-Oct-2023</strong></p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-8 font-sans border-y border-slate-200 py-4 relative z-10">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Consignee:</p>
                    <p className="text-xs font-bold text-black">Reliance Textiles Ltd.</p>
                    <p className="text-[10px] leading-relaxed text-slate-600">Lower Parel, HQ<br />Mumbai, Maharashtra</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Dispatch Via:</p>
                    <p className="text-xs font-bold text-black">V-Trans Logistics</p>
                    <p className="text-[10px] leading-relaxed text-slate-600">LR No: VT-99283<br />Veh: MH-04-AX-2911</p>
                  </div>
                </div>
                
                <table className="w-full text-[10px] mb-8 font-sans relative z-10">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-black">
                      <th className="py-2 text-left">Description</th>
                      <th className="py-2 text-center">Packaging</th>
                      <th className="py-2 text-right">Qty (Mtr)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-black">
                    <tr>
                      <td className="py-3">
                        <p className="font-bold">Cotton Twill - Royal Navy</p>
                        <p className="text-[9px] text-slate-500">Premium Grade A | Size: 44" | Wgt: 220g</p>
                      </td>
                      <td className="py-3 text-center">12 Rolls / 5 Bags</td>
                      <td className="py-3 text-right font-bold">1,200.00</td>
                    </tr>
                    <tr>
                      <td className="py-3">
                        <p className="font-bold">Heavy Denim - Obsidian</p>
                        <p className="text-[9px] text-slate-500">Rugged 14oz | Size: 60" | Wgt: 450g</p>
                      </td>
                      <td className="py-3 text-center">8 Rolls / 2 Bags</td>
                      <td className="py-3 text-right font-bold">400.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 text-black">
                      <td className="py-3 text-right font-bold uppercase" colSpan="2">Total Quantity:</td>
                      <td className="py-3 text-right font-black text-sm">1,600.00 MTR</td>
                    </tr>
                  </tfoot>
                </table>
                
                <div className="mt-auto grid grid-cols-3 gap-4 font-sans border-t border-slate-100 pt-8 relative z-10 text-black">
                  <div className="text-center">
                    <div className="h-10 border-b border-slate-200 mb-2"></div>
                    <p className="text-[8px] uppercase font-bold text-slate-500">Receiver's Sign</p>
                  </div>
                  <div className="text-center">
                    <div className="h-10 border-b border-slate-200 mb-2"></div>
                    <p className="text-[8px] uppercase font-bold text-slate-500">Gate Entry</p>
                  </div>
                  <div className="text-center">
                    <div className="h-10 border-b border-slate-200 mb-2"></div>
                    <p className="text-[8px] uppercase font-bold text-slate-500">Authorized Sign</p>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between border border-blue-900/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded">
                    <span className="material-symbols-outlined text-green-500">info</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Cloud Sync Active</p>
                    <p className="text-[10px] text-slate-500">Last saved 2 minutes ago</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors">HISTORY</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchGeneration;
