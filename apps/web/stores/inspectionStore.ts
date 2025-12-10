import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Inspection, InspectionFilters, Finding } from "@/types";

interface InspectionState {
  currentInspection: Inspection | null;
  inspections: Inspection[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  filters: InspectionFilters;
  selectedIds: string[];
  draftFindings: Finding[];
  setCurrentInspection: (inspection: Inspection | null) => void;
  setInspections: (inspections: Inspection[]) => void;
  addInspection: (inspection: Inspection) => void;
  updateInspection: (id: string, updates: Partial<Inspection>) => void;
  removeInspection: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setCreating: (isCreating: boolean) => void;
  setUpdating: (isUpdating: boolean) => void;
  setFilters: (filters: Partial<InspectionFilters>) => void;
  resetFilters: () => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  addDraftFinding: (finding: Finding) => void;
  removeDraftFinding: (id: string) => void;
  clearDraftFindings: () => void;
  reset: () => void;
}

const initialFilters: InspectionFilters = {
  page: 1,
  limit: 10,
};

export const useInspectionStore = create<InspectionState>()(
  devtools(
    persist(
      (set) => ({
        currentInspection: null,
        inspections: [],
        isLoading: false,
        isCreating: false,
        isUpdating: false,
        filters: initialFilters,
        selectedIds: [],
        draftFindings: [],
        setCurrentInspection: (inspection) =>
          set({ currentInspection: inspection }),
        setInspections: (inspections) => set({ inspections }),
        addInspection: (inspection) =>
          set((state) => ({
            inspections: [inspection, ...state.inspections],
          })),
        updateInspection: (id, updates) =>
          set((state) => ({
            inspections: state.inspections.map((i) =>
              i.id === id ? { ...i, ...updates } : i
            ),
            currentInspection:
              state.currentInspection?.id === id
                ? { ...state.currentInspection, ...updates }
                : state.currentInspection,
          })),
        removeInspection: (id) =>
          set((state) => ({
            inspections: state.inspections.filter((i) => i.id !== id),
            currentInspection:
              state.currentInspection?.id === id
                ? null
                : state.currentInspection,
          })),
        setLoading: (isLoading) => set({ isLoading }),
        setCreating: (isCreating) => set({ isCreating }),
        setUpdating: (isUpdating) => set({ isUpdating }),
        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),
        resetFilters: () => set({ filters: initialFilters }),
        toggleSelection: (id) =>
          set((state) => ({
            selectedIds: state.selectedIds.includes(id)
              ? state.selectedIds.filter((i) => i !== id)
              : [...state.selectedIds, id],
          })),
        selectAll: (ids) => set({ selectedIds: ids }),
        clearSelection: () => set({ selectedIds: [] }),
        addDraftFinding: (finding) =>
          set((state) => ({
            draftFindings: [...state.draftFindings, finding],
          })),
        removeDraftFinding: (id) =>
          set((state) => ({
            draftFindings: state.draftFindings.filter((f) => f.id !== id),
          })),
        clearDraftFindings: () => set({ draftFindings: [] }),
        reset: () =>
          set({
            currentInspection: null,
            inspections: [],
            isLoading: false,
            isCreating: false,
            isUpdating: false,
            filters: initialFilters,
            selectedIds: [],
            draftFindings: [],
          }),
      }),
      {
        name: "inspection-store",
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    )
  )
);
