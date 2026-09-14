import { TypedFormBuilder } from './utils/typed-form-builder.util';

// TESTS
type Expect<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

// TESTS
const fb = new TypedFormBuilder();
const group = fb.group({
  campoString1: [''],
  campoString2: [{ value: '' }],
  campoString3: '',
});
const campoString4 = fb.control('');
const campoString5 = fb.control({ value: '' });
type IsEveryDefinitionEqual = Expect<
  Equal<
    typeof group.controls.campoString1.value,
    typeof group.controls.campoString2.value
  >
> &
  Expect<
    Equal<
      typeof group.controls.campoString1.value,
      typeof group.controls.campoString3.value
    >
  > &
  Expect<
    Equal<typeof group.controls.campoString1.value, typeof campoString4.value>
  > &
  Expect<
    Equal<typeof group.controls.campoString1.value, typeof campoString5.value>
  >;

const group2 = fb.group({
  objectOrString: ['' as string | object],
  teste: {
    numero123: ''
  }
});
const group2RawValue = group2.getRawValue();

type IsObjectTypingCorrect = Expect<
  Equal<typeof group2RawValue.objectOrString, string | object | null>
>;


