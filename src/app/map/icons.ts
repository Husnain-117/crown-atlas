"use client"

import L from "leaflet"
import { formatPrice } from "@/lib/utils"

// Custom marker icons used across map components
export const createCustomIcon = (
  price: number,
  status: string,
  propertyType: string,
  isInSearchArea = false
) => {
  const pinColor = status === "For Sale" ? "#2563eb" : "#0891b2" // blue-600 or cyan-600
  const ringStyle = isInSearchArea ? "filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.8));" : ""

  return L.divIcon({
    className: "custom-marker-icon",
    html: `
      <div style="position: relative; width: 40px; height: 50px; ${ringStyle}">
        <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Pin shadow -->
          <ellipse cx="20" cy="47" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
          
          <!-- Pin body -->
          <path d="M20 0C11.7157 0 5 6.71573 5 15C5 23.2843 20 45 20 45C20 45 35 23.2843 35 15C35 6.71573 28.2843 0 20 0Z" 
                fill="${pinColor}"/>
          
          <!-- Pin inner circle (white) -->
          <circle cx="20" cy="15" r="8" fill="white"/>
          
          <!-- Pin center dot -->
          <circle cx="20" cy="15" r="4" fill="${pinColor}"/>
        </svg>
        
        <!-- Price tooltip on hover -->
        <div class="pin-price-tooltip" style="
          position: absolute;
          bottom: 52px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 9999;
        ">
          ${formatPrice(price)}
          <div style="
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 4px solid rgba(0, 0, 0, 0.85);
          "></div>
        </div>
      </div>
      <style>
        .custom-marker-icon:hover .pin-price-tooltip {
          opacity: 1 !important;
        }
      </style>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
  })
}
