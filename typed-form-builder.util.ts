/**
 * Angular Typed Form Builder 
 * Version: 0.1.10
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

type ExtractValue<T> = T extends TypedAbstractControl<any> ? T
  : T extends { value?: infer U; disabled?: boolean } ? U
  : T extends ValidatorFn ? never
  : T;

export type ExtractValueFromControlDefinition<T> = ExtractValue<UnwrapArray<T>>;

export type DeepValue<T> = T extends Function | Date | RegExp ? T
  : T extends object ? { [K in keyof T]: ExtractValueFromControlDefinition<DeepValue<T[K]>> }
  : T;

export type DeepPartial<T> = T extends Function | Date | RegExp ? T
  : T extends object ? { [K in keyof T]?: ExtractValueFromControlDefinition<DeepPartial<T[K]>> }
  : T;

export interface TypedFormControl<T> extends FormControl { }
export class TypedFormControl<T> extends FormControl {
  declare value: ExtractValueFromControlDefinition<T>;

  declare valueChanges: Observable<T>;

  declare defaultValue: T;

  declare setValue: (
    value: T,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ) => void;

  declare patchValue: (
    value: DeepPartial<T>,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ) => void;
}

type TypedAbstractControl<T> = [T] extends [TypedFormGroup<infer U>] ? TypedFormGroup<U>
  : [T] extends [TypedFormControl<infer U>] ? TypedFormControl<U>
  : [T] extends [TypedFormArray<infer U>] ? TypedFormArray<U>
  : TypedFormControl<T>;


export type PathsOf<T> = T extends TypedAbstractControl ? PathsOf<DeepValue<T>> : {
  [K in keyof T & string]:
  T[K] extends object ? (K | `${K}.${PathsOf<T[K]>}`) : K

}

// TYPED FORM GROUP TYPING
export class TypedFormGroup<T> extends FormGroup {
  declare controls: {
    [K in keyof T]: TypedAbstractControl<ExtractValueFromControlDefinition<T[K]>>;
  };

  declare value: {
    [K in keyof T]: ExtractValueFromControlDefinition<T[K]>;
  };

  declare valueChanges: Observable<DeepValue<T>>;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare setValue: (value: DeepValue<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }) => void;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare get: (path: PathsOf<T>) => TypedAbstractControl<ExtractValueFromControlDefinition<T[K]>> | null;

  declare addControl: (name: string, control: TypedAbstractControl<any>, options?: { emitEvent?: boolean }) => void;

  declare contains: (controlName: keyof T | (string & {})) => boolean;

  declare getRawValue: () => DeepPartial<T>;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare patchValue: (value: DeepPartial<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }) => void;

  declare removeControl: (name: keyof T | (string & {}), options?: { emitEvent?: boolean }) => void;

  declare reset: (value?: DeepPartial<T>, options?: { onlySelf?: boolean; emitEvent?: boolean }) => void;

  declare setControl: <K extends keyof T>(
    name: Extract<K, string>,
    control: TypedFormControl<T[K]> | AbstractControl,
    options?: { emitEvent?: boolean }
  ) => void;
}


// TYPED FORM ARRAY TYPING
export class TypedFormArray<T> extends FormArray {
  declare readonly controls: TypedAbstractControl<ExtractValueFromControlDefinition<T>>[];

  declare readonly value: T[];

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
    formState: TypedControlDefinition<T>,
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
