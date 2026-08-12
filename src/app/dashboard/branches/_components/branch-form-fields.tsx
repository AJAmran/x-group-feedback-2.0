"use client";

import { FormField } from "@/components/ui/FormField";
import { TextInput } from "@/components/ui/TextInput";

export interface BranchFormState {
  name: string;
  code: string;
  address: string;
  phone: string;
  latitude: number | "";
  longitude: number | "";
}

export const EMPTY_BRANCH_FORM: BranchFormState = {
  name: "",
  code: "",
  address: "",
  phone: "",
  latitude: "",
  longitude: "",
};

/** Shared create/edit fields for a branch record. */
export function BranchFields({
  formData,
  onChange,
}: {
  formData: BranchFormState;
  onChange: (patch: Partial<BranchFormState>) => void;
}) {
  return (
    <div className="space-y-4">
      <FormField label="Branch Name" required>
        <TextInput
          required
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Downtown Cafe"
        />
      </FormField>

      <FormField label="Branch Code" required hint="Unique short identifier, e.g. DT-01">
        <TextInput
          required
          value={formData.code}
          onChange={(e) => onChange({ code: e.target.value })}
          placeholder="e.g. DT-01"
        />
      </FormField>

      <FormField label="Address" required>
        <TextInput
          required
          value={formData.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Full street address"
        />
      </FormField>

      <FormField label="Phone (Optional)">
        <TextInput
          value={formData.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="Contact number"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Latitude" required hint="e.g. 23.7461 (must not be 0)">
          <TextInput
            required
            type="number"
            step="any"
            min="-90"
            max="90"
            value={formData.latitude}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ latitude: v === "" ? "" : Number(v) });
            }}
            placeholder="e.g. 23.7461"
          />
        </FormField>
        <FormField label="Longitude" required hint="e.g. 90.3749 (must not be 0)">
          <TextInput
            required
            type="number"
            step="any"
            min="-180"
            max="180"
            value={formData.longitude}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ longitude: v === "" ? "" : Number(v) });
            }}
            placeholder="e.g. 90.3749"
          />
        </FormField>
      </div>
    </div>
  );
}