"use client";

import { create } from "zustand";
import { trackLeadEvent } from "@/lib/analytics/conversion";

export type ContactPanelMode = "tour" | "agent";

type ContactPanelState = {
  isOpen: boolean;
  propertyKey: string;
  propertyAddress: string;
  mode: ContactPanelMode;
  open: (opts: { propertyKey: string; propertyAddress: string; mode: ContactPanelMode }) => void;
  close: () => void;
};

export const useContactPanel = create<ContactPanelState>((set) => ({
  isOpen: false,
  propertyKey: "",
  propertyAddress: "",
  mode: "agent",
  open: ({ propertyKey, propertyAddress, mode }) => {
    trackLeadEvent("lead_cta_click", {
      source: "property-contact-panel",
      kind: mode === "tour" ? "tour" : "contact",
      hasPropertyContext: Boolean(propertyKey || propertyAddress),
      listingKey: propertyKey,
    });
    set({ isOpen: true, propertyKey, propertyAddress, mode });
  },
  close: () => set({ isOpen: false }),
}));
