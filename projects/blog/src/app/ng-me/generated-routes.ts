// THIS FILE WAS GENERATED BY TOOLING. DO NOT EDIT THIS FILE DIRECTLY.
import { Routes } from "@angular/router"

export const GENERATED_ROUTES: Routes = [
  {
    path: "posts/angular-components-in-markdown",
    title: "Angular Components in Markdown | Aleksander Bodurri | Blog",
    loadChildren: () =>
      import(
        "projects/blog/src/app/ng-me/generated-route-modules/angular-components-in-markdown.module"
      ).then((m) => m.LazyModule),
  },
  {
    path: "posts/directive-context",
    title: "Directive Context | Aleksander Bodurri | Blog",
    loadChildren: () =>
      import(
        "projects/blog/src/app/ng-me/generated-route-modules/directive-context.module"
      ).then((m) => m.LazyModule),
  },
]