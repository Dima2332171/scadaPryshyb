import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Websocket} from '../../core/websocket';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main implements OnChanges{

  @Input() data: any;
  @Output() viewChange = new EventEmitter<any>();
  viewBox = '0 0 2150 350';
  fontSize = 24


  krpz: any[] = [
    {name: '1', id: 1, x: 50, y: -200, different: 'option1', vacuum_switch: true},
    {name: '2', id: 2, x: 250, y: -200, different: 'option2', vacuum_switch: true},
    {name: '3', id: 3, x: 450, y: -200, p: 1.123, relay_protection: 'ok', vacuum_switch: true},
    {name: '4', id: 4, x: 930, y: -200, p: 2.875, relay_protection: 'error', vacuum_switch: true},
    {name: '5', id: 5, x: 1700, y: -200, p: 2.231, relay_protection: 'ok', vacuum_switch: true},
    {name: '6', id: 6, x: 1900, y: -200, p: 4.85, relay_protection: 'ok',vacuum_switch: true},
  ]

  ktp: any[] = [
    {
      name: '3', id: 7, x: 50, y: 120, load_switch: true, earthing_switch_1: false, earthing_switch_2: true,
      inverters: [
        {id: 701, name: '3.1', nominal_p: 1000, x: 75, y: 470, p: 4.765},
        {id: 702, name: '3.2', nominal_p: 1000, x: 375, y: 470, p: 3.765}
      ],
      transformers: [
        {name: 'transformer', id: 101, x: 225, y: 280}
      ]
    },
    {
      name: '2', id: 8, x: 550, y: 120, load_switch: true, earthing_switch_1: false, earthing_switch_2: false,
      inverters: [
        {id: 801, name: '2.1', nominal_p: 1000, x: 75, y: 470, p: 4.365},
        {id: 802, name: '2.2', nominal_p: 1000, x: 375, y: 470, p: 4.565}
      ],
      transformers: [
        {name: 'transformer', id: 102, x: 225, y: 280}
      ]
    },
    {
      name: '1', id: 9, x: 1050, y: 120, load_switch: true, earthing_switch_1: false, earthing_switch_2: false,
      inverters: [
        {id: 901, name: '1.1', nominal_p: 1000, x: 75, y: 470, p: 4.765},
        {id: 902, name: '1.2', nominal_p: 1000, x: 375, y: 470, p: 4.665}
      ],
      transformers: [
        {name: 'transformer', id: 103, x: 225, y: 280}
      ]
    },
  ]

  mvc: any[] = [
    {
      name: '1', id: 1, x: 1600, y: 120, soc: 90,
      bess: [
        {name: 'bess', id: 1001, x: 12, y: 440},
        {name: 'bess', id: 1002, x: 340, y: 440},
      ],
      inverters:
        [
          {name: 'inverter', id: 91, x: 225, y: 320, p: 4.465},
        ],
    },
    // {name: '1', id: 1, x:1700, y:210, },
  ]

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.data)
  }

  openView(view:any, id:any){
    this.viewChange.emit({view, id});
  }


  get fontSizePx() {
    return this.fontSize + 'px';
  }

  getKrpz(id: any){
    return this.data?.krpz.find((k:any) => k.id === id);
  }

  getKtp(id: any){
    return this.data?.ktp.find((k:any) => k.id === id);
  }

  getInverterKtp(id: any){
    return this.data?.ktp
      .flatMap((k: any) => k.inverters || [])
      .find((inv: any) => inv.id === id);
  }

  toggleVacuumSwitch(item: any) {
    item.vacuum_switch = !item.vacuum_switch;
  }

  toggleLoadSwitch(item: any) {
    item.load_switch = !item.load_switch;
  }

  toggleEarthSwitch1(item: any) {
    item.earthing_switch_1 = !item.earthing_switch_1;
  }

  toggleEarthSwitch2(item: any) {
    item.earthing_switch_2 = !item.earthing_switch_2;
  }


}
