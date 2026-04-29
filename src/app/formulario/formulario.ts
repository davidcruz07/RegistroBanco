import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormBuilder, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { JsonPipe, CommonModule } from "@angular/common";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashCan, faPlus, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { delay } from 'rxjs/internal/operators/delay';
import { map } from 'rxjs/internal/operators/map';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario {
  private fb = inject(FormBuilder);

  faTrash = faTrashCan;
  faAdd = faPlus;
  faCheckCircle = faCheckCircle;

  isSubmitting = false;
  isSuccess = false;
  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  form = this.fb.group({
    personalInfo: this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: ['', [Validators.required, Validators.email], [this.emailExistenteValidator.bind(this)]],
      birthdate: ['', [Validators.required]],
      phones: this.fb.array([])
    }, { validators: [this.mayorEdadValidator] }),

    passwordInfo: this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: [this.matchPasswordValidator] }),

    terms: [false, [Validators.requiredTrue]],
  });

  get phones() {
    return this.form.get('personalInfo.phones') as FormArray;
  }

  addPhone() {

    this.phones.push(this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]+$/)]));
  }

  removePhone(index: number) {
    this.phones.removeAt(index);
  }

  private emailExistenteValidator(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    const emailDict = ['josedcm9@gmail.com'];
    const emailValue = control.value?.toLowerCase();

    if (!emailValue) return of(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        const existe = emailDict.includes(emailValue);

        if (existe) {
          resolve({ emailTomado: true });
        } else {
          resolve(null);
        }
      }, 1500); 
    });
  }

  private mayorEdadValidator(control: AbstractControl): ValidationErrors | null {
    const birthdate = control.get('birthdate')?.value;
    if (!birthdate) return null;

    const today = new Date();
    const birthDateObj = new Date(birthdate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    return age >= 18 ? null : { menorEdad: true };
  }

  private matchPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { noCoinciden: true };
  }

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;

      setTimeout(() => {
        this.isSubmitting = false;

        alert('¡Registro exitoso! La cuenta ha sido creada.');
        this.form.reset();

        console.log('Formulario reiniciado tras el alert');
      }, 2000);
    }
  }
}
