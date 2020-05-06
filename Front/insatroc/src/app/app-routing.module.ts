import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { PostViewerComponent } from './annonces/post-viewer/post-viewer.component';
import { HomepageComponent } from './homepage/homepage.component';
import { PostCreateAltComponent } from './annonces/post-create-alt/post-create-alt.component';
import { ConnectionComponent} from './connection/connection.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { PostViewerByIdComponent } from './annonces/post-viewer-by-id/post-viewer-by-id.component';

import { AuthGuardService as AuthGuard} from './auth-guard.service';

const routes: Routes = [
  // {path: '', component: AppComponent},
  {path: 'deposer-une-annonce', component: PostCreateAltComponent, canActivate: [AuthGuard]},
  {path: 'toutes-les-annonces', component: PostViewerComponent},
  {path: 'connexion', component: ConnectionComponent},
  {path: 'creer-un-compte', component: CreateAccountComponent},
  {path: '', component: HomepageComponent},
  {path: 'annonce/:id', component: PostViewerByIdComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
