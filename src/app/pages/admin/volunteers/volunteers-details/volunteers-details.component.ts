import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { VolunteersFacadeService } from '@services/volunteers/volunteers-facade.service';
import {
  map,
  takeUntil,
  filter,
  tap,
  switchMap,
  skipWhile
} from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Subject, of, EMPTY } from 'rxjs';
import { IVolunteer } from '@models/volunteers';

const minTemp = 36;
const maxTemp = 41;

@Component({
  selector: 'app-volunteers-details',
  templateUrl: './volunteers-details.component.html',
  styleUrls: ['./volunteers-details.component.scss']
})
export class VolunteersDetailsComponent implements OnInit, OnDestroy {
  public tempStep = '0.1';
  zones = [
    {
      label: 'Centru',
      value: 'centru'
    }
  ];

  form = this.fb.group({
    _id: [null],
    first_name: [null, Validators.required],
    last_name: [null, Validators.required],
    email: [null, [Validators.required, Validators.email]],
    phone: [
      null,
      [Validators.required, Validators.minLength(8), Validators.maxLength(8)]
    ],
    telegram_id: [null],
    // gender: ['male', Validators.required],
    address: [null, Validators.required],
    zone_address: [null, Validators.required],
    is_active: [false, Validators.required],
    facebook_profile: [null, Validators.required],
    age: [null, Validators.required],
    availability: [null, Validators.required],
    activity_types: [null, Validators.required],
    password: [{ value: 'random', disabled: true }, Validators.required],
    created_by: [null, [Validators.maxLength(500)]],
    team: [null, [Validators.maxLength(500)]],
    profession: [null, [Validators.maxLength(500)]],
    comments: [null, [Validators.maxLength(500)]],
    last_temperature: [
      minTemp,
      [
        Validators.required,
        ValidateTemperature,
      ]
    ],
    need_sim_unite: [null, Validators.required],
    new_volunteer: [true, Validators.required],
    black_list: [null, Validators.required],
    received_cards: [null, Validators.required],
    sent_photo: [null, Validators.required],
  });
  currentVolunteeerId: string;
  componentDestroyed$ = new Subject();
  isLoading$ = this.volunteerFacade.isLoading$;
  error$ = this.volunteerFacade.error$;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private volunteerFacade: VolunteersFacadeService
  ) {
    this.route.paramMap
      .pipe(
        map(params => params.get('id')),
        tap(id => (this.currentVolunteeerId = id)),
        takeUntil(this.componentDestroyed$)
      )
      // .subscribe(volunteer => {
      .subscribe(id => {
        this.currentVolunteeerId = id;
        if (id) {
          this.volunteerFacade.getVolunteerById(id);
          this.form.get('password').disable();
        } else {
          this.form.get('password').enable();
        }
      });
  }

  ngOnInit() {
    this.volunteerFacade.volunteerDetails$
      .pipe(
        filter(volunteer => !!volunteer),
        // Fix issue switching between 'new' and 'details' page
        map(volunteer => (this.currentVolunteeerId ? volunteer : {})),
        takeUntil(this.componentDestroyed$)
      )
      .subscribe(volunteer => {
        this.form.patchValue(volunteer);
      });
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  onSubmit() {
    if (this.form.valid) {
      this.volunteerFacade.saveVolunteer(this.form.getRawValue());
    } else {
      console.log('invalid form', this.form);
    }
  }

  get created_by() { return this.form.get('created_by'); }
  get team() { return this.form.get('team'); }
  get profesia() { return this.form.get('profesia'); }
  get profession() { return this.form.get('profession'); }
  get comments() { return this.form.get('comments'); }
  get last_temperature() { return this.form.get('last_temperature'); }
  get need_sim_unite() { return this.form.get('need_sim_unite'); }
  get new_volunteer() { return this.form.get('new_volunteer'); }
  get black_list() { return this.form.get('black_list'); }
  get received_cards() { return this.form.get('received_cards'); }
  get sent_photo() { return this.form.get('sent_photo'); }

}

export function ValidateTemperature(control: AbstractControl) {
  if (control.value && (isNaN(control.value) || control.value < minTemp)) {
    return { minlength: { requiredLength: minTemp } };
  }
  if (control.value && (isNaN(control.value) || control.value > maxTemp)) {
    return { maxlength: { requiredLength: maxTemp } };
  }
  return null;

}
