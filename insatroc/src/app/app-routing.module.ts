import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { PostViewerComponent } from './annonces/post-viewer/post-viewer.component';
import { HomepageComponent } from './homepage/homepage.component';
import { PostCreateAltComponent } from './annonces/post-create-alt/post-create-alt.component';
import { ConnectionComponent} from './user/connection/connection.component';
import { CreateAccountComponent } from './user/create-account/create-account.component';
import { PostViewerByIdComponent } from './annonces/post-viewer-by-id/post-viewer-by-id.component';
import { UserPostsComponent } from './user/user-posts/user-posts.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { SearchResultsComponent } from './annonces/search-results/search-results.component';
import { ForgottenPasswordComponent } from './user/forgotten-password/forgotten-password.component';

import { AuthGuardService as AuthGuard} from './auth-guard.service';

const routes: Routes = [
  {path: 'deposer-une-annonce', component: PostCreateAltComponent, canActivate: [AuthGuard]},
  {path: 'toutes-les-annonces', component: PostViewerComponent},
  {path: 'connexion', component: ConnectionComponent},
  {path: 'creer-un-compte', component: CreateAccountComponent},
  {path: '', component: HomepageComponent},
  {path: 'annonce', component: PostViewerByIdComponent},
  {path: 'mes-annonces', component: UserPostsComponent},
  {path: 'mon-profil', component: UserProfileComponent},
  {path: 'search', component: SearchResultsComponent},
  {path: 'mot-de-passe-oublie', component: ForgottenPasswordComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
