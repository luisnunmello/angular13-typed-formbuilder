/**
 * Angular Typed Form Builder 
 * Version: 0.1.6
 * Repository: https://github.com/luisnunmello/angular13-typed-formbuilder/
 * MIT License
 *
 * Copyright (c) 2026 Luís Eduardo

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {
  AbstractControl,
  AbstractControlOptions,
  AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormControl,
  FormControlOptions,
  FormGroup,
  ValidatorFn
} from '@angular/forms';
import { Observable } from 'rxjs';

type UnwrapArray<T> = T extends readonly (infer U)[] ? UnwrapArray<U> : T;

type ExtractValue<T> = T extends TypedAbstractControl<any>
  ? T
  : T extends { value?: infer U; disabled?: boolean }
  ? U
  : T extends ValidatorFn
  ? never
  : T;

export type ExtractValueFromControlDefinition<T> = ExtractValue<UnwrapArray<T>>;

export type DeepPartial<T> = T extends Function | Date | RegExp
  ? T
  : T extends object
  ? { [K in keyof T]?: ExtractValueFromControlDefinition<DeepPartial<T[K]>> }
  : T;

export interface TypedFormControl<T> extends FormControl {
  setValue(
    value: T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ): void;
  patchValue(
    value: DeepPartial<T>,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ): void;
}

export class TypedFormControl<T> extends FormControl {
  declare value: ExtractValueFromControlDefinition<T>;
  declare valueChanges: Observable<T>;
  declare defaultValue: T;
}

type TypedAbstractControl<T> = T extends TypedFormGroup<infer U>
  ? TypedFormGroup<U>
  : T extends TypedFormControl<infer U>
  ? TypedFormControl<U>
  : T extends TypedFormArray<infer U>
  ? TypedFormArray<U>
  : TypedFormControl<T>;

// TYPED FORM GROUP TYPING
export interface TypedFormGroup<T> extends FormGroup {
  get<K extends keyof T>(path: K): TypedAbstractControl<ExtractValueFromControlDefinition<T[K]>> | null;

  get(path: string | (string | number)[]): AbstractControl | null;

  addControl(name: string, control: TypedAbstractControl<any>, options?: { emitEvent?: boolean }): void;

  contains(controlName: keyof T | (string & {})): boolean;

  getRawValue(): DeepPartial<T>;

  patchValue(value: DeepPartial<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }): void;

  patchValue(value: { [key: string]: any }, options?: { onlySelf?: boolean; emitEvent?: boolean }): void;

  removeControl(name: keyof T | (string & {}), options?: { emitEvent?: boolean }): void;

  reset(value?: DeepPartial<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }): void;

  setControl<K extends keyof T>(
    name: Extract<K, string>,
    control: TypedFormControl<T[K]> | AbstractControl,
    options?: { emitEvent?: boolean }
  ): void;

  setValue(value: T & { [key: string]: any }, options?: { onlySelf?: boolean; emitEvent?: boolean }): void;
}

export class TypedFormGroup<T> extends FormGroup {
  declare controls: {
    [K in keyof T]: TypedAbstractControl<ExtractValueFromControlDefinition<T[K]>>;
  };
  declare value: {
    [K in keyof T]: ExtractValueFromControlDefinition<T[K]>;
  };
  declare valueChanges: Observable<T[keyof T]>;
}

// TYPED FORM ARRAY TYPING
export interface TypedFormArray<T> extends FormArray {
  get(path: number): TypedAbstractControl<T> | null;
  get(path: Array<string | number> | string): AbstractControl | null;
  at(index: number): TypedAbstractControl<T>;

  insert(index: number, control: TypedAbstractControl<T>, options?: { emitEvent?: boolean }): void;

  push(control: TypedAbstractControl<T>, options?: { emitEvent?: boolean }): void;

  setControl(index: number, control: TypedAbstractControl<T>, options?: { emitEvent?: boolean }): void;

  setValue(value: T[], options?: { onlySelf?: boolean; emitEvent?: boolean }): void;
}

export class TypedFormArray<T> extends FormArray {
  declare readonly controls: TypedFormControl<T>[];
  declare readonly value: T[];
}

// TYPED FORM BUILDER TYPING
type TypedControlDefinition<T> = T | [T, ...any] | TypedFormControl<T>;

type TypedGroupControlConfigDefinition<T> = {
  [K in keyof T]: T[K];
};
type TypedArrayControlConfigDefinition<T> = TypedControlDefinition<T>[];

type FormBuilderOptions = Parameters<FormBuilder['group']>['1'];

export interface TypedFormBuilder {
  group<T>(controlsConfig: TypedGroupControlConfigDefinition<T>, options?: FormBuilderOptions): TypedFormGroup<T>;

  control<T>(
    formState: TypedControlDefinition<T>,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ): TypedFormControl<T>;

  array<T>(
    controlsConfig: TypedArrayControlConfigDefinition<T>,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ): TypedFormArray<T>;
}

export class TypedFormBuilder extends FormBuilder {}

// Utility type to check if two types are exactly equal
// type Expect<T extends true> = T;
// type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

// TESTS
