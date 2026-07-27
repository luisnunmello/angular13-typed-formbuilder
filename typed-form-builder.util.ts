/**
 * Angular Typed Form Builder 
 * Version: 0.1.1
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
  ValidatorFn,
} from '@angular/forms';
import { Observable } from 'rxjs';

export type DeepPartial<T> = T extends {
  value: infer V;
  patchValue: any;
}
  ? DeepPartial<V>
  : T extends Function | Date | RegExp
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

// FORM CONTROL TYPING
export interface TypedControl<ObjectValue> extends FormControl {
  setValue(
    value: ObjectValue,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    },
  ): void;
  patchValue(
    value: ObjectValue,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    },
  ): void;
}
export class TypedControl<ObjectValue> extends FormControl {
  declare value: ObjectValue;
  declare valueChanges: Observable<ObjectValue>;
  declare defaultValue: ObjectValue;
}

// TYPED FORM GROUP TYPING
export interface TypedFormGroup<ObjectType> extends FormGroup {
  get<ObjectKey extends keyof ObjectType>(
    path: ObjectKey,
  ): TypedControl<ObjectType[ObjectKey]> | null;
  /** @inheritdoc FormGroup.get */
  get(path: string | (string | number)[]): AbstractControl | null;

  addControl<K extends keyof ObjectType>(
    name: Extract<K, string>,
    control: TypedControl<ObjectType[K]> | AbstractControl,
    options?: { emitEvent?: boolean },
  ): void;

  contains(controlName: keyof ObjectType | (string & {})): boolean;

  getRawValue(): DeepPartial<ObjectType>;

  patchValue(
    value: Partial<ObjectType>,
    options?: { onlySelf?: boolean; emitEvent?: boolean },
  ): void;

  removeControl(
    name: keyof ObjectType | (string & {}),
    options?: { emitEvent?: boolean },
  ): void;

  reset(
    value?: Partial<ObjectType>,
    options?: { onlySelf?: boolean; emitEvent?: boolean },
  ): void;

  setControl<K extends keyof ObjectType>(
    name: Extract<K, string>,
    control: TypedControl<ObjectType[K]> | AbstractControl,
    options?: { emitEvent?: boolean },
  ): void;

  setValue(
    value: ObjectType & { [key: string]: any },
    options?: { onlySelf?: boolean; emitEvent?: boolean },
  ): void;
}

export class TypedFormGroup<ObjectType> extends FormGroup {
  declare controls: {
    [ObjectKey in keyof ObjectType]: TypedControl<ObjectType[ObjectKey]>;
  };
  declare value: {
    [ObjectKey in keyof ObjectType]: ObjectType[ObjectKey];
  };
  declare valueChanges: Observable<ObjectType[keyof ObjectType]>;
}

// TYPED FORM ARRAY TYPING
export interface TypedFormArray<ObjectValues> extends FormArray {
  get(path: number): TypedControl<ObjectValues> | null;
  get(path: Array<string | number> | string): AbstractControl | null;
  at(index: number): TypedControl<ObjectValues>;

  insert(
    index: number,
    control: TypedControl<ObjectValues>,
    options?: { emitEvent?: boolean },
  ): void;

  push(
    control: TypedControl<ObjectValues>,
    options?: { emitEvent?: boolean },
  ): void;

  setControl(
    index: number,
    control: TypedControl<ObjectValues>,
    options?: { emitEvent?: boolean },
  ): void;

  setValue(
    value: ObjectValues[],
    options?: { onlySelf?: boolean; emitEvent?: boolean },
  ): void;
}

export class TypedFormArray<ObjectValues> extends FormArray {
  declare readonly controls: TypedControl<ObjectValues>[];
  declare readonly value: ObjectValues[];
}

// TYPED FORM BUILDER TYPING
type TypedControlDefinition<ObjectType> =
  | ObjectType
  | [ObjectType, ...any]
  | TypedControl<ObjectType>;
// | ({ value: ObjectType[ObjectKeys] } & {
//     [key: string | number | symbol]: any;
//   });

type TypedGroupControlConfigDefinition<ObjectType> = {
  [ObjectKeys in keyof ObjectType]: TypedControlDefinition<
    ObjectType[ObjectKeys]
  >;
};
type TypedArrayControlConfigDefinition<ObjectType> =
  TypedControlDefinition<ObjectType>[];

type FormBuilderOptions = Parameters<FormBuilder['group']>['1'];

export interface TypedFormBuilder {
  group<ObjectType>(
    controlsConfig: TypedGroupControlConfigDefinition<ObjectType>,
    options?: FormBuilderOptions,
  ): TypedFormGroup<ObjectType>;

  control<ObjectValue>(
    formState: TypedControlDefinition<ObjectValue>,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  ): TypedControl<ObjectValue>;

  array<ObjectType>(
    controlsConfig: TypedArrayControlConfigDefinition<ObjectType>,
    validatorOrOpts?:
      | ValidatorFn
      | ValidatorFn[]
      | AbstractControlOptions
      | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  ): TypedFormArray<ObjectType>;
}

export class TypedFormBuilder extends FormBuilder {}
