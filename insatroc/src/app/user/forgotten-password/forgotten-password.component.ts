import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.component.html',
  styleUrls: ['./forgotten-password.component.css']
})
export class ForgottenPasswordComponent implements OnInit {
  secretQuestions = ["Quel est le nom de jeune fille de votre mère ?",
  "Quel était le nom de votre premier animal de companie ?",
  "En quelle année est né votre grand-père maternel ?",
  "Dans quel département êtes-vous né ?",
  "Quel est le deuxième prénom de votre père ?",
  "Quel est votre film préféré ?"];
  email: string;
  questionID1: number;
  questionID2: number;

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
  }

  getSecretQuestions(){
    this.authService.getSecretQuestions(this.email).subscribe(
      (response) => {console.log(response);
                    this.questionID1 = response[0];
                    this.questionID2 = response[1];},
      (error) => {console.log(error);}
    )
  }

}
