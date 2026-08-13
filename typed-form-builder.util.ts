/**
 * Angular Typed Form Builder 
 * Version: 0.1.14
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

type FormControlState<T> = {value?: T, disabled?: boolean};

type UnwrapArray<T> = T extends readonly (infer U)[] ? UnwrapArray<U> : T;

type ExtractValue<T> = T extends TypedAbstractControl<any> ? T
  : T extends FormControlState<infer U> ? U
  : T extends ValidatorFn ? never
  : T;

export type ExtractValueFromControlDefinition<T> = ExtractValue<UnwrapArray<T>>;

export type DeepValue<T> = T extends Function | Date | RegExp ? T
  : T extends object ? { [K in keyof T]: ExtractValueFromControlDefinition<DeepValue<T[K]>> }
  : T;

export type DeepPartialValue<T> = T extends Function | Date | RegExp ? T
  : T extends object ? { [K in keyof T]?: ExtractValueFromControlDefinition<DeepPartialValue<T[K]>> }
  : T;

export class TypedFormControl<T, UseRawValue extends boolean = false> extends FormControl {
  declare value: UseRawValue extends false ? ExtractValueFromControlDefinition<T> : T;

  declare valueChanges: Observable<T>;

  declare defaultValue: T;

  declare setValue: (
    value: UseRawValue extends false ? DeepValue<T> : T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ) => void;

  declare patchValue: (
    value: UseRawValue extends false ? DeepPartialValue<T> : T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ) => void;
}

export type TypedAbstractControl<T> = [T] extends [TypedFormGroup<infer U>] ? TypedFormGroup<U>
  : [T] extends [TypedFormControl<infer U>] ? TypedFormControl<U>
  : [T] extends [TypedFormArray<infer U>] ? TypedFormArray<U>
  : TypedFormControl<T>;
// TYPED FORM GROUP TYPING
export type TwoLevelPathFormGroup<T> = T extends TypedFormGroup<infer U> ? {
    [K in keyof U & string]: | K | (
          U[K] extends TypedFormGroup<any> ? `${K}.${keyof U[K]["controls"] & string}` : never
    )
  }[keyof U & string]
: never;

export type ControlAtPath<T extends TypedFormGroup<any>, P extends TwoLevelPathFormGroup<T>> =
  P extends `${infer X}.${infer Y}` ? // IF Path is x.y
    X extends keyof T['controls'] ? // IF x is key of T.controls
     T['controls'][X] extends TypedFormGroup<any> ? // IF T.controls.x is TypedFormGroup
      Y extends keyof T['controls'][X]['controls'] ? // IF y is key of T.controls.x.controls
        T['controls'][X]['controls'][Y] // yes, Return type of T.controls.x.controls.y
        : never // no (impossible), y is not key of T.controls.x.controls
      : never // no (impossible), T.controls.x is not TypedFormGroup
    : never  // no (impossible), x is not a key of T.controls
  : P extends keyof T['controls'] ? 
    T['controls'][P] 
    : never; // no, T.controls.x not key of T.control (impossible) 
export class TypedFormGroup<T, UseRawValue extends boolean = false> extends FormGroup {
  declare controls: {
    [K in keyof T]: TypedAbstractControl<UseRawValue extends false ? ExtractValueFromControlDefinition<T[K]> : T[K]>;
  };

  declare value: {
    [K in keyof T]: UseRawValue extends false ? ExtractValueFromControlDefinition<T[K]> : T[K];
  };

  declare valueChanges: Observable<DeepValue<T>>;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare setValue: (value: DeepValue<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }) => void;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare get: <K extends TwoLevelPathFormGroup<TypedFormGroup<T>>>(path: K) => TypedAbstractControl<ExtractValueFromControlDefinition<ControlAtPath<TypedFormGroup<T>, K>>> | null;

  declare addControl: (name: string, control: TypedAbstractControl<any>, options?: { emitEvent?: boolean }) => void;

  declare contains: (controlName: keyof T | (string & {})) => boolean;

  declare getRawValue: () => DeepPartialValue<T>;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare patchValue: (value: DeepPartialValue<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }) => void;

  declare removeControl: <K extends TwoLevelPathFormGroup<TypedFormGroup<T>>>(name: K, options?: { emitEvent?: boolean }) => void;

  declare reset: (value?: DeepPartialValue<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }) => void;

  declare setControl: <K extends TwoLevelPathFormGroup<TypedFormGroup<T>>>(
    name: K,
    control: TypedAbstractControl<ExtractValueFromControlDefinition<ControlAtPath<TypedFormGroup<T>, K>>>,
    options?: { emitEvent?: boolean }
  ) => void;
}


// TYPED FORM ARRAY TYPING
export class TypedFormArray<T, UseRawValue extends boolean = false> extends FormArray {
  declare readonly controls: TypedAbstractControl<ExtractValueFromControlDefinition<T>>[];

  declare readonly value: UseRawValue extends false ? ExtractValueFromControlDefinition<T>[] : T[];

  declare get: (path: Array<string | number> | string) => TypedAbstractControl<ExtractValueFromControlDefinition<T>> | null;

  declare at: (index: number) => TypedAbstractControl<ExtractValueFromControlDefinition<T>>;

  declare insert: (index: number, control: TypedAbstractControl<T>, options?: { emitEvent?: boolean }) => void;

  declare push: (control: TypedAbstractControl<ExtractValueFromControlDefinition<T>>, options?: { emitEvent?: boolean }) => void;

  declare setControl: (
    index: number,
    control: TypedAbstractControl<ExtractValueFromControlDefinition<T>>,
    options?: { emitEvent?: boolean }
  ) => void;

  declare setValue: (value: T[], options?: { onlySelf?: boolean; emitEvent?: boolean }) => void;
}

// TYPED FORM BUILDER TYPING
type TypedControlDefinition<T> = T | [T, ...any] | TypedFormControl<T>;

type TypedGroupControlConfigDefinition<T> = {
  [K in keyof T]: T[K];
};

type TypedArrayControlConfigDefinition<T> = TypedControlDefinition<T>[];

type FormBuilderOptions = Parameters<FormBuilder['group']>['1'];

export class TypedFormBuilder extends FormBuilder {
  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare group: <T>(controlsConfig: TypedGroupControlConfigDefinition<T>, options?: FormBuilderOptions) => TypedFormGroup<T>;

  declare control: <T>(
    formState: T | FormControlState<T>,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) => TypedFormControl<T>;

  declare array: <T>(
    controlsConfig: TypedArrayControlConfigDefinition<T>,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) => TypedFormArray<T>;
}

// TESTS
// type Expect<T extends true> = T;
// type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

// TESTS
