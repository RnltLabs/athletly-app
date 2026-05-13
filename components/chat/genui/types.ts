/**
 * GenUI Types - Athletly V2
 *
 * Types for the `ui_component` SSE event payload emitted by the backend
 * agent. Each component type has its own props shape. The frontend renders
 * the matching React Native component inline in the chat and emits a normal
 * user message when the user submits.
 *
 * Locked contract - keep in sync with the backend tools that emit this.
 */

export type UIComponentType =
  | 'choice_single'
  | 'choice_multi'
  | 'number_stepper'
  | 'date_picker'
  | 'confirm';

export interface ChoiceSingleProps {
  readonly question: string;
  readonly options: ReadonlyArray<string>;
  readonly submit_label?: string;
}

export interface ChoiceMultiProps {
  readonly question: string;
  readonly options: ReadonlyArray<string>;
  readonly submit_label?: string;
}

export interface NumberStepperProps {
  readonly question: string;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly initial?: number;
  readonly unit?: string;
  readonly submit_label?: string;
}

export interface DatePickerProps {
  readonly question: string;
  readonly min_date?: string;
  readonly max_date?: string;
  readonly initial_date?: string;
  readonly submit_label?: string;
}

export interface ConfirmProps {
  readonly question: string;
  readonly confirm_label?: string;
  readonly cancel_label?: string;
}

/**
 * Raw UI component payload as it arrives from the SSE event. The `props`
 * field is intentionally loosely typed here; the registry narrows on the
 * `type` discriminator before passing to the concrete component.
 */
export interface UIComponent {
  readonly type: UIComponentType;
  readonly id: string;
  readonly props: Record<string, unknown>;
}
