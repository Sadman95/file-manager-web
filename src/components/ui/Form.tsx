// Reusable controlled form kit: AppForm wrapper plus TextField input.
"use client";

import { FormProvider, useController, useFormContext } from "react-hook-form";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Reusable controlled form wrapper (react-hook-form + zod).
 * Any dialog supplies its own `useForm(...)` instance; this component only
 * provides context, submit wiring, and consistent actions styling.
 */
interface AppFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void;
  submitLabel: string;
  onCancel: () => void;
  children: ReactNode;
}

export function AppForm<T extends FieldValues>({
  form,
  onSubmit,
  submitLabel,
  onCancel,
  children,
}: AppFormProps<T>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
        {children}
        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

interface TextFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  autoFocus?: boolean;
  /** Fired on every keystroke — e.g. for live previews — without subscribing via `watch()`. */
  onValueChange?: (value: string) => void;
}

/** Controlled text input bound via `useController` — works in any `AppForm`. */
export function TextField({ name, label, placeholder, autoFocus, onValueChange }: TextFieldProps) {
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input
        {...field}
        onChange={(e) => {
          field.onChange(e);
          onValueChange?.(e.target.value);
        }}
        type="text"
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-invalid={!!error}
        className={cn(
          "w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none",
          error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-slate-400",
        )}
      />
      {error?.message && (
        <span role="alert" className="mt-1 block text-xs text-red-600">
          {error.message}
        </span>
      )}
    </label>
  );
}
