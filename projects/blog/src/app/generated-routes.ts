// THIS FILE WAS GENERATED BY TOOLING. DO NOT EDIT THIS FILE DIRECTLY.
import { Routes } from '@angular/router';

export const GENERATED_ROUTES: Routes = [
  {
    path: 'posts/angular',
    title: 'Angular',
    loadChildren: () =>
      import('./generated-modules/angular.module').then((m) => m.LazyModule),
  },
  {
    path: 'posts/react',
    title: 'React',
    loadChildren: () =>
      import('./generated-modules/react.module').then((m) => m.LazyModule),
  },
  {
    path: 'posts/vue',
    title: 'Vue',
    loadChildren: () =>
      import('./generated-modules/vue.module').then((m) => m.LazyModule),
  },
];