# angular13-typed-formbuilder
Typed Form Builder util for your angular projects

## How to Use:
- Copy the code in typed-form-builder.util.ts somewhere to your code base.
- In your component, define the provider for TypedFormBuilder using FormBuilder as useExisting.
  ```typescript
  @Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [
      {
        provide: TypedFormBuilder,
        useExisting: FormBuilder,
      },
    ],
  })
  ```
- Inject TypedFormBuilder in your component, and use it as you would use FormBuilder.
- Enjoy!

## Current Known Limitations
- In ArrayControl, there could be situations where you define an initial type for the array, but afterwards wants to add another datatype to it. Currently i don't know how i could make this more intuitive to use, but you need to specify the type clearly on the array creation, like
```typescript
  const arrayControl = this.fb.array(['test'] as (string | number)[]);
  arrayControl.push(this.fb.control(123));
``` 

## Examples
```typescript
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    {
      provide: TypedFormBuilder,
      useExisting: FormBuilder,
    },
  ],
})
export class AppComponent {
  constructor(private fb: TypedFormBuilder) {}
  form = this.generateForm();

  // This returns an Typed FormGroup!
  generateForm() {
    return this.fb.group({
      test: this.fb.control('oi'),
      number: 123,
    }); // This returns an Typed FormGroup!
  }
  otherExamples() {
    const form = this.fb.group({
      test: this.fb.control('oi'),
      number: 123,
    }); // This returns an Typed FormGroup!
    console.log(form.get('test')?.value.trim());
    console.log(form.get('number')?.value.toFixed());
    console.log(form.controls.number.value.toPrecision());

    const control = this.fb.control('test'); // This returns an Typed FormControl with type string!
    console.log(control.value.substring(1));

    const array1 = this.fb.array(['string', 'other text']); // This returns an Typed FormArray with type string[]!
    array1.value.forEach((val) => {
      console.log(val.substring(1));
    });
    // The property array1.controls is also typed

    const array2 = this.fb.array(['string', 123]); // This returns an Typed FormArray with type (string | number)[]!
    console.log(array2.value);
    // The property array1.controls is also typed
  }
}
```
