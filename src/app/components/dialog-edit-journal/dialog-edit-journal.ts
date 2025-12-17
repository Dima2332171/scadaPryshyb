import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-journal',
  imports: [],
  templateUrl: './dialog-edit-journal.html',
  styleUrl: './dialog-edit-journal.css',
})
export class DialogEditJournal implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ){

  }


  ngOnInit() {
    console.log(this.data)
  }
}
