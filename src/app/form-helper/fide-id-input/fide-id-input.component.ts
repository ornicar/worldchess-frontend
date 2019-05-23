import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-fide-id-input',
  templateUrl: 'fide-id-input.component.html',
  styleUrls: ['fide-id-input.component.scss']
})
export class FideIdInputComponent {
    @Input() fideId: FormControl;
    @Input() hint: string;
}
