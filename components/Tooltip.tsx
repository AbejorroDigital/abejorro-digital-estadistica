import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Propiedades para el componente Tooltip.
 * @interface TooltipProps
 * @property {string} content - El texto informativo que se mostrará dentro del globo.
 * @property {React.ReactNode} children - El elemento o texto que activará el tooltip al pasar el ratón.
 */
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

/**
 * Componente Tooltip (Globo de Ayuda).
 * Proporciona información contextual flotante utilizando Portales de React.
 * * * @description El uso de Portales permite que el tooltip se renderice directamente en el `document.body`, 
 * evitando problemas de posicionamiento (z-index) o recortes de contenedores padres.
 * * @component
 */
export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  // Estado para controlar la visibilidad del tooltip
  const [isVisible, setIsVisible] = useState(false);
  
  // Estado para las coordenadas exactas donde debe aparecer el tooltip
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  
  // Referencia al elemento que envuelve al 'children' para calcular su posición
  const triggerRef = useRef<HTMLDivElement>(null);

  /**
   * Calcula la posición del elemento activador y muestra el tooltip.
   * Utiliza getBoundingClientRect para obtener las coordenadas relativas al viewport.
   */
  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        left: rect.left + rect.width / 2, // Centrado horizontal
        top: rect.top - 6 // Un pequeño margen de 6px sobre el elemento
      });
      setIsVisible(true);
    }
  };

  /**
   * Oculta el tooltip cuando el puntero sale del elemento.
   */
  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      ref={triggerRef}
      className="inline-block cursor-help"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Si es visible, teletransportamos el elemento al final del body 
          para que no lo afecten los estilos del contenedor padre.
      */}
      {isVisible && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none flex flex-col items-center"
          style={{
            left: `${coords.left}px`,
            top: `${coords.top}px`,
            transform: 'translate(-50%, -100%)' // Ajuste para que crezca hacia arriba desde el centro
          }}
        >
          {/* Contenedor del texto */}
          <div className="relative z-10 rounded-md bg-slate-900 p-2 text-xs text-white shadow-xl text-center leading-relaxed w-48 border border-slate-700">
            {content}
          </div>
          
          {/* Triángulo indicador (Flecha) */}
          <div className="h-2 w-2 -translate-y-1 rotate-45 bg-slate-900 border-r border-b border-slate-700"></div>
        </div>,
        document.body
      )}
    </div>
  );
};
