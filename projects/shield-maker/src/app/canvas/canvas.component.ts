import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ShieldService } from '../shield.service';

@Component({
  selector: 'shield-maker-canvas',
  template: `
    <svg
      #exportSvg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.1"
      id="Layer_1"
      x="0px"
      y="0px"
      viewBox="0 0 250 250"
      style="enable-background:new 0 0 250 250;"
      xml:space="preserve"
    >
      <style type="text/css">
        .shield-maker-primary {
          fill: {{ shieldService.primary | async }} !important;
        }

        .shield-maker-secondary {
          fill: {{ shieldService.secondary | async }} !important;
        }

        foreignObject path, foreignObject circle, foreignObject rect, foreignObject polygon {
          fill: {{ shieldService.iconColor | async }} !important;
        }

        foreignObject path[fill="none"], foreignObject circle[fill="none"], foreignObject rect[fill="none"], foreignObject polygon[fill="none"] {
          fill: none !important;
        }
      </style>
      <g #container>
        <polygon
          class="shield-maker-primary"
          points="125,30 125,30 125,30 31.9,63.2 46.1,186.3 125,230 125,230 125,230 203.9,186.3 218.1,63.2  "
        />
        <polygon
          class="shield-maker-secondary"
          points="125,30 125,52.2 125,52.1 125,153.4 125,153.4 125,230 125,230 203.9,186.3 218.1,63.2 125,30  "
        />
        <ng-container *ngIf="customSvgIcon !== null; else materialIcon">
          <foreignObject
            [innerHtml]="customSvgIcon"
            [attr.x]="shieldService.iconX | async"
            [attr.y]="shieldService.iconY | async"
            [attr.width]="shieldService.iconSize | async"
            [attr.height]="shieldService.iconSize | async"
          >
          </foreignObject>
        </ng-container>
        <ng-template #materialIcon>
          <foreignObject
            [attr.x]="shieldService.iconX | async"
            [attr.y]="shieldService.iconY | async"
            [attr.width]="shieldService.iconSize | async"
            [attr.height]="shieldService.iconSize | async"
          >
            <mat-icon
              [style.width.px]="shieldService.iconSize | async"
              [style.height.px]="shieldService.iconSize | async"
              [svgIcon]="namespace + ':' + (shieldService.icon | async)"
            ></mat-icon>
          </foreignObject>
        </ng-template>
      </g>
    </svg>
    <div class="menu-buttons">
      <button (click)="export()" color="primary" mat-icon-button disableRipple>
        <mat-icon>download</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .menu-buttons {
        position: absolute;
        top: 15px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &.left {
          left: 20px;
          flex-direction: row;
          width: 100px;
        }

        &:not(.left) {
          right: 20px;
          flex-direction: column;
          height: 100px;
        }

        button {
          mat-icon {
            font-size: 50px;
            width: 50px;

            &:hover {
              opacity: 0.8;
            }
          }
        }

        img {
          width: 50px;
          height: 50px;

          &:hover {
            opacity: 0.8;
          }
        }
      }
    `,
  ],
})
export class CanvasComponent implements OnInit {
  @ViewChild('exportSvg') svgToExport: any;
  @ViewChild('container') svgContainer: any;

  subscriptions: Subscription[] = [];

  namespace: string = '';

  customSvgIcon: SafeHtml | null = null;

  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    public shieldService: ShieldService,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.shieldService.icon.subscribe(
      () => (this.namespace = this.shieldService.namespace())
    );

    this.shieldService.iconRotation.subscribe((rotation) => {
      if (!this.svgContainer) {
        return;
      }

      const foreignObject = [...this.svgContainer.nativeElement.children].find(
        (i) => i.tagName === 'foreignObject'
      );
      let targetToRotate;

      if (!foreignObject) {
        return;
      }

      targetToRotate = foreignObject.children[0];

      if (this.customSvgIcon === null) {
        targetToRotate = targetToRotate?.children?.[0];
      }

      targetToRotate?.setAttribute?.('transform', `rotate(${rotation})`);
    });

    this.shieldService.svgAsString.subscribe((svgString) => {
      if (svgString === '') {
        this.customSvgIcon = null;
        return;
      }

      const domParser = new DOMParser();
      const svgDocument = domParser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDocument.children[0];

      svgElement.removeAttribute('height');
      svgElement.removeAttribute('width');

      const xmlString = new XMLSerializer().serializeToString(svgElement);

      this.customSvgIcon = this.domSanitizer.bypassSecurityTrustHtml(xmlString);
    });
  }

  sanitizeXML(elements: Element[]) {
    elements.forEach((element: Element) => {
      let ngAttributes: string[] = [];
      let ngClasses: string[] = [];

      for (let i = 0; i < element.attributes.length; i++) {
        const name = element.attributes[i].name;
        if (name.startsWith('_ng')) {
          ngAttributes.push(name);
        } else if (name.startsWith('ng')) {
          ngAttributes.push(name);
        }
      }

      for (let i = 0; i < element.classList.length; i++) {}

      element.classList.forEach(
        (className) => className.startsWith('ng') && ngClasses.push(className)
      );

      ngAttributes.forEach((attribute) =>
        element.attributes.removeNamedItem(attribute)
      );
      ngClasses.forEach((className) => element.classList.remove(className));
      this.sanitizeXML(Array.from(element.children));
    });
  }

  export() {
    const clone = this.svgToExport.nativeElement.cloneNode(true);
    this.sanitizeXML([clone]);

    const xmlString = new XMLSerializer().serializeToString(clone);
    const downloadLink = document.createElement('a');

    downloadLink.download = `shield.svg`;
    downloadLink.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      xmlString
    )}`;
    downloadLink.click();
  }
}
