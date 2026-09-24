'use client';

import React, { useState } from 'react';
import { QrCode, X, ShieldCheck, Printer, Download, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface AssetQrModalProps {
  activo: any | null;
  onClose: () => void;
}

export function AssetQrModal({ activo, onClose }: AssetQrModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!activo) return null;

  const handlePrint = () => {
    const stickerEl = document.getElementById('qr-sticker-card');
    // Seleccionar específicamente el SVG del código QR, NO el icono del escudo
    const svgEl = document.getElementById('qr-code-svg') || stickerEl?.querySelector('.qr-canvas-white svg');
    const svgHtml = svgEl ? svgEl.outerHTML : '';

    // Crear un iframe invisible dedicado para aislar 100% la impresión
    let iframe = document.getElementById('qr-print-isolated-frame') as HTMLIFrameElement;
    if (iframe) {
      iframe.remove();
    }

    iframe = document.createElement('iframe');
    iframe.id = 'qr-print-isolated-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Etiqueta_${activo.codigo}</title>
          <style>
            @page {
              size: auto;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #ffffff;
              padding: 12px;
            }
            .sticker {
              width: 300px;
              border: 2.5px solid #000000;
              border-radius: 16px;
              padding: 16px 14px;
              text-align: center;
              background: #ffffff;
              color: #000000;
            }
            .header-tag {
              font-size: 10px;
              font-weight: 900;
              letter-spacing: 0.08em;
              color: #312e81;
              text-transform: uppercase;
              margin-bottom: 6px;
            }
            .codigo {
              font-size: 26px;
              font-weight: 900;
              font-family: monospace;
              letter-spacing: 0.12em;
              color: #000000;
              margin-bottom: 8px;
            }
            .qr-box {
              display: inline-block;
              padding: 6px;
              background: #ffffff;
              border: 1px solid #94a3b8;
              border-radius: 10px;
              margin-bottom: 10px;
            }
            .qr-box svg {
              display: block;
              width: 175px;
              height: 175px;
            }
            .info {
              border-top: 1.5px solid #cbd5e1;
              padding-top: 8px;
              font-size: 11px;
              line-height: 1.4;
            }
            .info .device {
              font-weight: 800;
              font-size: 13px;
              color: #000000;
            }
            .info .sn {
              font-family: monospace;
              font-weight: 700;
              color: #1e293b;
              margin-top: 1px;
            }
            .info .fac {
              font-family: monospace;
              font-weight: 800;
              color: #4338ca;
              margin-top: 1px;
            }
            .info .loc {
              color: #475569;
              font-weight: 600;
              margin-top: 1px;
            }
            .info .id {
              font-size: 9px;
              font-family: monospace;
              color: #94a3b8;
              margin-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div class="header-tag">🛡️ SOPORTE TI · CONTROL PATRIMONIAL</div>
            <div class="codigo">${activo.codigo}</div>
            <div class="qr-box">
              ${svgHtml}
            </div>
            <div class="info">
              <div class="device">
                ${activo.tipo}${activo.marca ? ` · ${activo.marca}` : ''}${activo.modelo ? ` · ${activo.modelo}` : ''}
              </div>
              ${activo.numeroSerie ? `<div class="sn">S/N: ${activo.numeroSerie}</div>` : ''}
              ${activo.codigoFactura ? `<div class="fac">FACTURA: ${activo.codigoFactura}</div>` : ''}
              <div class="loc">${activo.sede || 'Sede General'}${activo.departamento ? ` - ${activo.departamento}` : ''}</div>
              <div class="id">ID: ${(activo.id || '').substring(0, 8)}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Error al imprimir por iframe, usando fallback:', err);
        window.print();
      }
    }, 250);
  };

  const handleDescargarPng = async () => {
    const stickerEl = document.getElementById('qr-sticker-card');
    if (!stickerEl) return;

    try {
      setIsDownloading(true);
      // Usar html2canvas para renderizar la tarjeta física completa con QR, textos y bordes
      const canvas = await html2canvas(stickerEl, {
        scale: 3, // Calidad ultra alta (300 DPI) para imprimir o pegar
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const a = document.createElement('a');
      a.download = `Etiqueta_${activo.codigo}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      toast.success('Etiqueta descargada exitosamente en PNG');
    } catch (err) {
      console.error('Error al descargar PNG:', err);
      toast.error('Error al generar la imagen PNG');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Cabecera del Modal */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <QrCode className="w-4 h-4 text-indigo-600" /> Etiqueta QR Patrimonial
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjeta Visual de la Etiqueta */}
        <div className="p-6 flex flex-col items-center justify-center bg-white text-center">
          <div 
            id="qr-sticker-card" 
            className="border-2 border-dashed border-slate-300 p-5 rounded-2xl flex flex-col items-center gap-3 bg-white w-full"
          >
            <div className="flex items-center gap-1.5 text-indigo-600 font-black text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> SOPORTE TI · CONTROL PATRIMONIAL
            </div>

            <h4 className="text-2xl font-black text-slate-900 tracking-widest font-mono">
              {activo.codigo}
            </h4>

            <div className="bg-white qr-canvas-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <QRCodeSVG
                id="qr-code-svg"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/activo/${activo.id}`}
                size={170}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="w-full text-center border-t border-slate-200 pt-2 text-xs space-y-0.5">
              <p className="font-bold text-slate-800">
                {activo.tipo}
                {activo.marca ? ` · ${activo.marca}` : ''}
                {activo.modelo ? ` · ${activo.modelo}` : ''}
              </p>
              {activo.numeroSerie && (
                <p className="font-mono text-[11px] text-slate-700 font-semibold">
                  S/N: {activo.numeroSerie}
                </p>
              )}
              {activo.codigoFactura && (
                <p className="font-mono text-[11px] text-indigo-600 font-bold">
                  FAC: {activo.codigoFactura}
                </p>
              )}
              <p className="text-slate-500 font-medium">{activo.sede || 'Sede General'} {activo.departamento ? `- ${activo.departamento}` : ''}</p>
              <p className="text-[10px] text-slate-400 font-mono">ID: {activo.id?.substring(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* Botonera Inferior */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDescargarPng}
            disabled={isDownloading}
            className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            title="Descargar imagen completa de la etiqueta"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Descargar PNG</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
