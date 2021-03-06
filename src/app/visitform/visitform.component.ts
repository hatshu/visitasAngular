import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  AUTOCOMPLETE_PANEL_HEIGHT
} from '@angular/material';

import { VisitlistComponent } from '../visitlist/visitlist.component';
import { IVisit } from '../model/visit';
import { VisitService } from '../services/visit.service';
import { DBOperation } from '../shared/DBOperations';
import { Global } from '../shared/Global';

@Component({
  selector: 'app-visitform',
  templateUrl: './visitform.component.html',
  styleUrls: ['./visitform.component.scss']
})
export class VisitformComponent implements OnInit {
  msg: string;
  indLoading = false;
  visitFrm: FormGroup;
  // listFilter: string;
  // selectedOption: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private _visitService: VisitService,
    public dialogRef: MatDialogRef<VisitlistComponent>
  ) {}

  ngOnInit() {
    this.visitFrm = this.fb.group({
      id: [''],
      motivo: ['', [Validators.required, Validators.maxLength(50)]],
      duracion: [''],
      responsableCatec: ['', [Validators.required]],
      fecha: [''],
    });

    // subscribe on value changed event of form to show validation message
    this.visitFrm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();

    if (this.data.dbops === DBOperation.create) {
      this.visitFrm.reset();
    } else {
      this.visitFrm.setValue(this.data.visit);
    }
    this.SetControlsState(
      this.data.dbops === DBOperation.delete ? false : true
    );
  }
  // form value change event
  onValueChanged(data?: any) {
    if (!this.visitFrm) {
      return;
    }
    const form = this.visitFrm;
    // tslint:disable-next-line:forin
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      // setup custom validation message to form
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        // tslint:disable-next-line:forin
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }
  // form errors model
  // tslint:disable-next-line:member-ordering
  formErrors = {
    motivo: '',
    duracion: '',
    responsableCatec: '',
    // fecha: ''
  };
  // custom valdiation messages
  // tslint:disable-next-line:member-ordering
  validationMessages = {
    motivo: {
      maxlength: 'Motivo cannot be more than 50 characters long.',
      required: 'Motivo is required.'
    },
    // duracion: {
    //   required: 'Duracion is required.'
    // },
    responsableCatec: {
      required: 'Responsable is required.'
    },
    // fecha: {
    //   required: 'Fecha is required.'
    // }
  };
  onSubmit(formData: any) {
     const visitData = this.mapDateData(formData.value);
    switch (this.data.dbops) {
      case DBOperation.create:
        this._visitService
          // .addVisit(Global.BASE_USER_ENDPOINTVisit + 'addVisit', visitData)
          .addVisit(Global.BASE_USER_ENDPOINTVisit + 'addVisit', visitData)
          .subscribe(
            data => {
              // Success
              if (data.message) {
                this.dialogRef.close('success');
              } else {
                this.dialogRef.close('error');
              }
            },
            error => {
              this.dialogRef.close('error');
            }
          );
        break;
      case DBOperation.update:
        this._visitService
          .updateVisit(
            Global.BASE_USER_ENDPOINTVisit + 'updateVisit',
             visitData.id,
             visitData
          )
          .subscribe(
            data => {
              // Success
              if (data.message) {
                this.dialogRef.close('success');
              } else {
                this.dialogRef.close('error');
              }
            },
            error => {
              this.dialogRef.close('error');
            }
          );
        break;
      case DBOperation.delete:
        this._visitService
          .deleteVisit(
            Global.BASE_USER_ENDPOINTVisit + 'deleteVisit',
            visitData.id,
          )
          .subscribe(
            data => {
              // Success
              if (data.message) {
                this.dialogRef.close('success');
              } else {
                this.dialogRef.close('error');
              }
            },
            error => {
              this.dialogRef.close('error');
            }
          );
        break;
    }
  }
  SetControlsState(isEnable: boolean) {
    isEnable ? this.visitFrm.enable() : this.visitFrm.disable();
  }

  mapDateData(visit: IVisit): IVisit {
    // visit.fecha = new Date(visit.fecha).toISOString();
    return visit;
  }
}
