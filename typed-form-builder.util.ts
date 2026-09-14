/**
 * Angular Typed Form Builder 
 * Version: 0.2.1
 * Repository: https://github.com/luisnunmello/angular13-typed-formbuilder/
 */

import {
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

type IsUnknown<T> = unknown extends T 
  ? ([T] extends [null] ? false : true) // Nuance to exclude 'any' or broader checks
  : false;

// I've readded the obligatory value because if youd use object in the Type, and both properties were non obligatory, it would go to #1 branch and try to infer a value from object type, which doesnt have any typing, resulting in unknown.
type FormControlState<T> = {disabled?: boolean, value?: T};

type UnwrapArray<T> = T extends readonly (infer U)[] ? UnwrapArray<U> : T;

type ExtractValue<T> = T extends TypedAbstractControl<any> ? T
  : T extends FormControlState<infer U> ? IsUnknown<U> extends true ? object : U // #1
  : T extends ValidatorFn ? never
  : T;

// Exclude null from typing
export type ExtractValueFromControlDefinition<T> = Exclude<ExtractValue<UnwrapArray<T>>, null>;

export type DeepValue<T, Nullable extends boolean = false> = T extends Function | Date | RegExp ? T
  : T extends object ? { [K in keyof T]: Nullable extends false ? ExtractValueFromControlDefinition<DeepValue<T[K]>> : ExtractValueFromControlDefinition<DeepValue<T[K]>> | null }
  : T;

export type DeepPartialValue<T> = T extends Function | Date | RegExp ? T
  : T extends object ? { [K in keyof T]?: ExtractValueFromControlDefinition<DeepPartialValue<T[K]>> }
  : T;

export class TypedFormControl<T> extends FormControl {
  declare value: ExtractValueFromControlDefinition<T> | null;

  declare valueChanges: Observable<ExtractValueFromControlDefinition<T> | null>;

  declare defaultValue: ExtractValueFromControlDefinition<T> | null;

  declare setValue: (
    value: DeepValue<ExtractValueFromControlDefinition<T>> | null,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ) => void;

  declare patchValue: (
    value: DeepPartialValue<ExtractValueFromControlDefinition<T>> | null,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ) => void;
}

export class RawTypedFormControl<T> extends TypedFormControl<T> {
  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare value: T | null;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare valueChanges: Observable<T | null>;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare defaultValue: T | null;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare setValue: (
    value: T | null,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    }
  ) => void;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare patchValue: (
    value: T | null,
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

export type RawTypedAbstractControl<T> = [T] extends [RawTypedFormGroup<infer U>] ? RawTypedFormGroup<U>
  : [T] extends [RawTypedFormControl<infer U>] ? RawTypedFormControl<U>
  : [T] extends [RawTypedFormArray<infer U>] ? RawTypedFormArray<U>
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
    
export class TypedFormGroup<T> extends FormGroup {
  declare controls: {
    [K in keyof T]: TypedAbstractControl<ExtractValueFromControlDefinition<T[K]>>;
  };

  declare value: {
    [K in keyof T]: ExtractValueFromControlDefinition<T[K]> | null;
  };

  declare valueChanges: Observable<DeepValue<T> | null>;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare setValue: (value: DeepValue<T> | null, options?: { onlySelf?: boolean; emitEvent?: boolean }) => void;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare get: <K extends TwoLevelPathFormGroup<TypedFormGroup<T>>>(path: K) => TypedAbstractControl<ExtractValueFromControlDefinition<ControlAtPath<TypedFormGroup<T>, K>>>;

  declare addControl: (name: string, control: TypedAbstractControl<any>, options?: { emitEvent?: boolean }) => void;

  declare contains: (controlName: keyof T | (string & {})) => boolean;

  declare getRawValue: () => DeepValue<T, true>;

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

export class RawTypedFormGroup<T> extends TypedFormGroup<T> {
  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare controls: {
    [K in keyof T]: TypedAbstractControl<T[K]>;
  };

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare value: {
    [K in keyof T]: T[K] | null;
  };
}


// TYPED FORM ARRAY TYPING
export class TypedFormArray<T> extends FormArray {
  declare readonly controls: TypedAbstractControl<ExtractValueFromControlDefinition<T>>[];

  declare readonly value: ExtractValueFromControlDefinition<T>[];

  declare get: (path: Array<string | number> | string) => TypedAbstractControl<ExtractValueFromControlDefinition<T>> | null;

  declare at: (index: number) => TypedAbstractControl<ExtractValueFromControlDefinition<T>>;

  declare insert: (index: number, control: TypedAbstractControl<T>, options?: { emitEvent?: boolean }) => void;

  declare push: (control: TypedAbstractControl<ExtractValueFromControlDefinition<T>>, options?: { emitEvent?: boolean }) => void;

  declare setControl: (
    index: number,
    control: TypedAbstractControl<ExtractValueFromControlDefinition<T>>,
    options?: { emitEvent?: boolean }
  ) => void;

  declare setValue: (value: TypedAbstractControl<ExtractValueFromControlDefinition<T>> | null[] , options?: { onlySelf?: boolean; emitEvent?: boolean }) => void;
}

// TYPED FORM ARRAY TYPING
export class RawTypedFormArray<T> extends TypedFormArray<T> {
  declare readonly controls: TypedAbstractControl<ExtractValueFromControlDefinition<T>>[];
  
  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare readonly value: T[];

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare get: (path: Array<string | number> | string) => T | null;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare at: (index: number) => T;

  declare insert: (index: number, control: TypedAbstractControl<T>, options?: { emitEvent?: boolean }) => void;

  declare push: (control: TypedAbstractControl<ExtractValueFromControlDefinition<T>>, options?: { emitEvent?: boolean }) => void;

  declare setControl: (
    index: number,
    control: TypedAbstractControl<ExtractValueFromControlDefinition<T>>,
    options?: { emitEvent?: boolean }
  ) => void;

  // @ts-ignore TS2416: intentional incompatible override for typed API
  declare setValue: (value: T | null[], options?: { onlySelf?: boolean; emitEvent?: boolean }) => void;
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