import { IContact } from './../model/contact';
import { Component, ViewChild, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material';
import { MatTableDataSource, MatSnackBar, MatPaginator } from '@angular/material';
import { MatDialog, Sort } from '@angular/material';
import { ContactformComponent } from '../contactform/contactform.component';
import { VisitlistforPersonComponent } from '../visitlistfor-person/visitlistfor-person.component';
import { ContactService } from '../services/contact.service';
import { DBOperation } from '../shared/DBOperations';
import { Global } from '../shared/Global';

@Component({
  selector: 'app-contactlist',
  templateUrl: './contactlist.component.html',
  styleUrls: ['./contactlist.component.scss']
})
export class ContactlistComponent implements OnInit {
  contacts: IContact[];
  contact: IContact;
  loadingState: boolean;
  dbops: DBOperation;
  modalTitle: string;
  modalBtnTitle: string;
  length: number;
  public pageSize = 10;
  public currentPage = 0;
  public totalSize = 0;
  public array: any;
  public dataSource: any;
  public contactoActivo: IContact;

  // set columns that will need to show in listing table
  // displayedColumns = ['name', 'email', 'gender', 'birth', 'techno', 'message', 'action'];
  displayedColumns = ['name', 'surname', 'dni', 'company', 'fecha', 'action'];

  // setting up datasource for material table
  // dataSource = new MatTableDataSource<IContact>();


  @ViewChild(MatPaginator) paginator: MatPaginator;
//   getProperty = (obj, path) => (
//     path.split('.').reduce((o, p) => o && o[p], obj)
// )
  constructor(public snackBar: MatSnackBar, private _contactService: ContactService, private dialog: MatDialog) { }

  ngOnInit() {
    this.loadingState = true;
    this.loadContacts();
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(ContactformComponent, {
      width: '600px',
      data: { dbops: this.dbops, modalTitle: this.modalTitle, modalBtnTitle: this.modalBtnTitle, contact: this.contact }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result === 'success') {
        this.loadingState = true;
        this.loadContacts();
        switch (this.dbops) {
          case DBOperation.create:
            this.showMessage('Data successfully added.');
            break;
          case DBOperation.update:
            this.showMessage('Data successfully updated.');
            break;
          case DBOperation.delete:
            this.showMessage('Data successfully deleted.');
            break;
        }
      } else if (result === 'error') {
        this.showMessage('There is some issue in saving records, please contact to system administrator!');
      } else {
       // this.showMessage('Please try again, something went wrong');
      }
    });
  }
  openseeVisits (id: number) {
    this.contactoActivo = this.dataSource.filter(x => x.id === id)[0];
    this.seeVisits(this.contactoActivo);
  }
  seeVisits(contact: IContact): void {
    const dialogRef2 = this.dialog.open(VisitlistforPersonComponent, {
      width: '800px',
      maxHeight: '700px',
      data: { dbops: this.dbops, modalTitle: this.modalTitle, modalBtnTitle: this.modalBtnTitle, contactoActivo: contact }
    });
    dialogRef2.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result === 'success') {
        this.loadingState = true;
        this.loadContacts();
        switch (this.dbops) {
          case DBOperation.create:
            this.showMessage('Data successfully added.');
            break;
          case DBOperation.update:
            this.showMessage('Data successfully updated.');
            break;
          case DBOperation.delete:
            this.showMessage('Data successfully deleted.');
            break;
        }
      } else if (result === 'error') {
        this.showMessage('There is some issue in saving records, please contact to system administrator!');
      } else {
       // this.showMessage('Please try again, something went wrong');
      }
    });
  }

  loadContacts() {
    this._contactService.getAllContact(Global.BASE_USER_ENDPOINT + 'getAllContact')
      .subscribe(contacts => {
        // this.dataSource = new MatTableDataSource<IContact>(contacts);
        this.dataSource = new MatTableDataSource<IContact>();
        this.dataSource = contacts;
        this.array =  this.sortAllDataByName(contacts);
        this.loadingState = false;
        this.totalSize = this.array.length;
        this.iterator();
    });
  }

private iterator() {
    const end = (this.currentPage + 1) * this.pageSize;
    const start = this.currentPage * this.pageSize;
    const part = this.array.slice(start, end);
    this.dataSource = part;
  }



  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.iterator();
  }

  getGender(gender: number): string {
    return Global.genders.filter(ele => ele.id === gender).map(ele => ele.name)[0];
  }

  addContact() {
    this.dbops = DBOperation.create;
    this.modalTitle = 'Add New Contact';
    this.modalBtnTitle = 'Add';
    this.openDialog();
  }
  editContact(id: number) {
    this.dbops = DBOperation.update;
    this.modalTitle = 'Edit Contact';
    this.modalBtnTitle = 'Update';
    this.contact = this.dataSource.filter(x => x.id === id)[0];
    this.openDialog();
  }
  deleteContact(id: number) {
    this.dbops = DBOperation.delete;
    this.modalTitle = 'Confirm to Delete ?';
    this.modalBtnTitle = 'Delete';
    this.contact = this.dataSource.filter(x => x.id === id)[0];
    this.openDialog();
  }
  showMessage(msg: string) {
    this.snackBar.open(msg, '', {
      duration: 3000
    });
  }

  sortAllDataByName(contacts: IContact[]): IContact[] {
    contacts.sort(function(a, b) {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) {
      // sort string ascending
      return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
   // default return value (no sorting)
      return 0;
  });
  return contacts;
  }

  sortData(sort: Sort) {
    const data = this.dataSource.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource = data;
      return;
    }

    this.dataSource = data.sort((a, b) => {
      const isAsc = sort.direction === 'desc';
      switch (sort.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'birth': return compare(a.birth, b.birth, isAsc);
        default: return 0;
      }
    });
  }
}
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
