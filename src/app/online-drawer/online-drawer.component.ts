import { environment } from '../../environments/environment';
import { Component, OnInit, HostListener } from '@angular/core';
import { IPixel } from '../i-pixel';
import * as _ from 'lodash';
import { IColor } from '../i-color';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-online-drawer',
  templateUrl: './online-drawer.component.html',
  styleUrls: ['./online-drawer.component.scss']
})
export class OnlineDrawerComponent implements OnInit {

  public environment = environment;
  public rows: IPixel[][] = [];
  public holdingDown = false;
  public selectedColor: IColor = 'black';
  public fsIPixels: IPixel[] = [];
  public fsIPixelsCollection: AngularFirestoreCollection<IPixel>;
  public newZoom: number;

  constructor(
    private angularFirestore: AngularFirestore,
  ) {
    (<any>window).rows = this.rows;
    this.makeResponsive();
    this.fsIPixelsCollection = this.angularFirestore.collection('iPixels');
    this.fsIPixelsCollection.snapshotChanges().map(changes => {
      return changes.map(change => {
        const iPixel = change.payload.doc.data() as IPixel;
        iPixel.id = change.payload.doc.id;
        return iPixel;
      });
    }).subscribe(fsIPixels => {
      this.fsIPixels = fsIPixels;
      this.updateIPixels(this.fsIPixels);
      this.removeIPixels(this.fsIPixels);
    });
  }

  private removeIPixels(fsIPixels: IPixel[]) {
    const nonWhiteIPixels = _(this.rows).flatMap().filter(iPixel => iPixel.color !== undefined).value();
    const iPixelsRemovedByOtherUsers = _.filter(nonWhiteIPixels, nwip => {
      return !_.find(fsIPixels, { x: nwip.x, y: nwip.y });
    });
    _.each(iPixelsRemovedByOtherUsers, ip => {
      ip.color = undefined;
    });
  }

  private updateIPixels(fsIPixels: IPixel[]) {
    _.each(fsIPixels, fsIPixel => {
      const iPixel: IPixel = this.getIPixel(fsIPixel);
      if (iPixel) {
        iPixel.color = fsIPixel.color;
      }
    });
  }

  private getIPixel(fsIPixel: IPixel): IPixel {
    let iPixel: IPixel;
    _.each(this.rows, row => {
      iPixel = _.find(row, { x: fsIPixel.x, y: fsIPixel.y });
      if (iPixel) {
        return false;
      }
    });
    return iPixel;
  }

  private getFsIPixel(iPixel: IPixel): IPixel {
    return _.find(this.fsIPixels, { x: iPixel.x, y: iPixel.y });
  }

  private makeResponsive() {
    const pageWidth = environment.width;
    const pageHeight = environment.height;
    const windowWidth = window.innerWidth,
      newScaleWidth = windowWidth / pageWidth;
    const windowHeight = window.innerHeight,
      newScaleHeight = windowHeight / pageHeight;
    const newZoom = Math.floor(Math.min(newScaleWidth, newScaleHeight));
    (<any>document).body.style.zoom = newZoom;
    this.newZoom = newZoom;
  }

  ngOnInit() {
    _.times(environment.width, x => {
      const row: IPixel[] = [];
      _.times(environment.height, y => {
        row.push({
          color: undefined,
          x,
          y
        });
      });
      this.rows.push(row);
    });
  }


  // @HostListener('document:touchend', ['$event'])
  // @HostListener('document:touchstart', ['$event'])
  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:mouseup', ['$event'])
  touchstart($event) {
    const map = { mouseup: 'up', mousedown: 'down', touchend: 'up', touchstart: 'down' };
    map[$event.type] === 'up' ? (this.holdingDown = false) : (this.holdingDown = true);
  }

  mouseover(iPixel: IPixel) {
    if (this.holdingDown) {
      this.draw(iPixel);
    }
  }

  @HostListener('document:touchmove', ['$event'])
  touchmove($event) {
    // screenX clientX pageX radiusX
    const z = this.newZoom;
    let x = _.round($event.touches[0].screenY / z);
    let y = _.round($event.touches[0].screenX / z);
    const iPixel = this.getIPixel(<any>{ x, y });
    iPixel && this.draw(iPixel);
  }

  draw(iPixel: IPixel) {
    if (iPixel.color === this.selectedColor) {
      return;
    }
    iPixel.color = this.selectedColor;
    const fsIPixel = this.getFsIPixel(iPixel);
    if (this.selectedColor === undefined) {
      if (fsIPixel) {
        this.angularFirestore.doc(`iPixels/${fsIPixel.id}`).delete();
      }
    } else {
      if (fsIPixel) {
        this.angularFirestore.doc(`iPixels/${fsIPixel.id}`).update(iPixel);
      } else {
        this.fsIPixelsCollection.add(iPixel);
      }
    }
  }

}
